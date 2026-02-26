import { defineBackend } from '@aws-amplify/backend'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import type { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda'
import { auth } from './auth/resource'
import { data } from './data/resource'
import { createWorkspaceFn } from './functions/create-workspace/resource'
import { generateInviteCodeFn } from './functions/generate-invite-code/resource'
import { acceptInviteFn } from './functions/accept-invite/resource'
import { removeMemberFn } from './functions/remove-member/resource'

const backend = defineBackend({
  auth,
  data,
  createWorkspaceFn,
  generateInviteCodeFn,
  acceptInviteFn,
  removeMemberFn,
})

const userPoolArn = backend.auth.resources.userPool.userPoolArn
const userPoolId = backend.auth.resources.userPool.userPoolId

const cognitoPolicy = new PolicyStatement({
  actions: [
    'cognito-idp:CreateGroup',
    'cognito-idp:AdminAddUserToGroup',
    'cognito-idp:AdminRemoveUserFromGroup',
    'cognito-idp:ListUsersInGroup',
    'cognito-idp:AdminGetUser',
  ],
  resources: [userPoolArn],
})

backend.createWorkspaceFn.resources.lambda.addToRolePolicy(cognitoPolicy)
backend.generateInviteCodeFn.resources.lambda.addToRolePolicy(cognitoPolicy)
backend.acceptInviteFn.resources.lambda.addToRolePolicy(cognitoPolicy)
backend.removeMemberFn.resources.lambda.addToRolePolicy(cognitoPolicy)
;(backend.createWorkspaceFn.resources.lambda as LambdaFunction).addEnvironment(
  'USER_POOL_ID',
  userPoolId
)
;(backend.generateInviteCodeFn.resources.lambda as LambdaFunction).addEnvironment(
  'USER_POOL_ID',
  userPoolId
)
;(backend.acceptInviteFn.resources.lambda as LambdaFunction).addEnvironment(
  'USER_POOL_ID',
  userPoolId
)
;(backend.removeMemberFn.resources.lambda as LambdaFunction).addEnvironment(
  'USER_POOL_ID',
  userPoolId
)

const tables = backend.data.resources.tables
for (const table of Object.values(tables)) {
  table.grantReadWriteData(backend.createWorkspaceFn.resources.lambda)
  table.grantReadWriteData(backend.generateInviteCodeFn.resources.lambda)
  table.grantReadWriteData(backend.acceptInviteFn.resources.lambda)
  table.grantReadWriteData(backend.removeMemberFn.resources.lambda)
}
