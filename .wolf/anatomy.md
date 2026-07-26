# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-07-18T15:32:05.833Z
> Files: 356 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitignore` — Git ignore rules (~141 tok)
- `.mcp.json` (~86 tok)
- `.prettierignore` — Build outputs (~95 tok)
- `.prettierrc.json` — Prettier configuration (~71 tok)
- `AGENTS.md` — OpenWolf (~68 tok)
- `amplify_outputs.json` (~5 tok)
- `CLAUDE.md` — OpenWolf (~3117 tok)
- `components.json` (~122 tok)
- `CONTRIBUTING.md` — Contributing to Tempest (~916 tok)
- `eslint.config.mjs` — ESLint flat configuration (~532 tok)
- `GEMINI.md` — OpenWolf (~68 tok)
- `LICENSE` — Project license (~288 tok)
- `next-env.d.ts` — / <reference types="next" /> (~72 tok)
- `next.config.mjs` — Next.js configuration (~408 tok)
- `package.json` — Node.js package manifest (~1428 tok)
- `playwright.config.ts` — Playwright test configuration (~204 tok)
- `postcss.config.mjs` — Declares config (~39 tok)
- `proxy.ts` — Lazily loaded Amplify server runner — null when amplify_outputs.json is absent (~956 tok)
  - fn `isPublicRoute` L36-39 (~36 tok)
  - fn `resolveLocale` L40-46 (~76 tok)
  - fn `proxy` L47-100 (~465 tok)
- `README.md` — Project documentation (~1282 tok)
- `SECURITY.md` — Security Policy (~365 tok)
- `tempest.config.yml` — tempest.config.yml (~166 tok)
- `tsconfig.json` — TypeScript configuration (~191 tok)
- `vitest.config.ts` — Vitest test configuration (~441 tok)
- `vitest.setup.ts` — Mock ResizeObserver for Radix UI components (~86 tok)

## .agent/skills/tempest-code-review/

- `SKILL.md` — Code Review Skill (Tempest) (~1260 tok)

## .agent/skills/tempest-coder/

- `SKILL.md` — Coder Skill (Tempest) (~1272 tok)

## .agent/skills/tempest-tech-lead/

- `SKILL.md` — Tech Lead Skill (Tempest) (~1089 tok)

## .amplify/artifacts/cdk.out/

- `amplify-tempest-kinloth-sandbox-e7ddf1c6ef.assets.json` (~15705 tok)
- `amplify-tempest-kinloth-sandbox-e7ddf1c6ef.template.json` (~3816 tok)
- `amplifytempestkinlothsandboxe7ddf1c6efauthED95E2A8.nested.template.json` (~6490 tok)
- `amplifytempestkinlothsandboxe7ddf1c6efdataamplifyDataAmplifyTableManagerAA97EF9A.nested.template.json` (~4774 tok)
- `amplifytempestkinlothsandboxe7ddf1c6efdataamplifyDataCategory2CE58D26.nested.template.json` (~21720 tok)
- `amplifytempestkinlothsandboxe7ddf1c6efdataamplifyDataConnectionStack6C5A0635.nested.template.json` (~19106 tok)
- `amplifytempestkinlothsandboxe7ddf1c6efdataamplifyDataCreditCardDC571D05.nested.template.json` (~21894 tok)
- `amplifytempestkinlothsandboxe7ddf1c6efdataamplifyDataExpense357ADE2F.nested.template.json` (~21871 tok)
- `amplifytempestkinlothsandboxe7ddf1c6efdataamplifyDataIncome88164AC9.nested.template.json` (~21394 tok)
- `amplifytempestkinlothsandboxe7ddf1c6efdataamplifyDataInstallmentC33ED550.nested.template.json` (~21834 tok)
- `amplifytempestkinlothsandboxe7ddf1c6efdataamplifyDataMonthlyData65CDFA7B.nested.template.json` (~21978 tok)
- `amplifytempestkinlothsandboxe7ddf1c6efdataD8D2B670.nested.template.json` (~18278 tok)
- `asset.02a15a456a4c84a7b2428b83550ee95a8fa503c3f6b08d85574847ea252fbeea.vtl` — if( $ctx.stash.deniedField ) (~228 tok)
- `asset.0309b89d01b40f0d451afb958b1f471bbfcc2f7979d4a1d4da139ade67533102.vtl` — if( $ctx.stash.deniedField ) (~519 tok)
- `asset.041534e5fd916595f752318f161512d7c7f83b9f2cf32d0f0be381c12253ff68.vtl` (~14 tok)
- `asset.064303962e481067b44300212516363b99aaee539b6bafaf756fdd83ff0b60f0.vtl` — # [Start] Parse owner field auth for Get. ** (~229 tok)
- `asset.06764d5fd013c0332f4c6377b353b2f4180c627b7285b078dadaaca293213263.vtl` — # [Start] Setting "isSystem" to default value of "false". ** (~113 tok)
- `asset.06db846fd14e6fc371f22b12b5545ba8e2dbfeda85d8c8d586c71c282166657b.vtl` — # [Start] Initialization default values. ** (~94 tok)
- `asset.08f4d557693d96c1a4efba0f9dc91330e4b19772fd5477c156468843e3d9cb5e.vtl` — # [Start] Get Request template. ** (~323 tok)
- `asset.0c4bf965cfbfb2eab5a56fcfec8159cce3dcb760920efcfa5f1c3f77f70c6999.vtl` — # [Start] Authorization Steps. ** (~762 tok)
- `asset.0f335c92f6b10569fbb06cfe8442ebbefad9bf926f217e0b6b334729aef965f4.vtl` — if( $ctx.stash.deniedField ) (~226 tok)
- `asset.193d15932c53c8ce411249ccd48170bf1e53c7e68177355e4e75cad4b0cb32cb.vtl` — # [Start] Create Request template. ** (~599 tok)
- `asset.1f5fed297da9c32ae3af922bf3a38ccf23b956078887d16891ec06c20c64722c.vtl` — # [Start] Get Request template. ** (~106 tok)
- `asset.239a70505f3931a1501db899b4d9b1cfb753555434692cf171733218fbcc9513.vtl` — # [Start] Authorization Steps. ** (~727 tok)
- `asset.273b9ced0b989619be61211bc3258bd04ab25e31d2c9c949010e025be365e61e.vtl` — if( $ctx.stash.deniedField ) (~520 tok)
- `asset.2bd7a17ac26a9db2f6e390d98cb1099bf8ac470b9a8996e36636ab5910b3e098.vtl` — # [Start] Create Request template. ** (~598 tok)
- `asset.38af1ab0d078d0e65e7b48d62b60530278b09fb4433bed25287315fdd4094b61.vtl` — # [Start] Authorization Steps. ** (~773 tok)
- `asset.3b6d810ef43cdbd93ef462c40b0df0328b89e04f1473a4f82f1178da1f1d5aa0.vtl` — # [Start] Authorization Steps. ** (~797 tok)
- `asset.431c85179da41c1e6119ed98d2b85e53af57e37e10c2c5bd158001f67acc38d5.vtl` — # [Start] Authorization Steps. ** (~746 tok)
- `asset.43d0dfe2b982f0d0b9631541639632276341452eb31a045df63650396a896328.vtl` — # [Start] Create Request template. ** (~598 tok)
- `asset.474bf0776ec2164a13191d1a0a9e057154931e4918fea5086f49850d02a5371b.vtl` — # [Start] Mutation Update resolver. ** (~1166 tok)
- `asset.49e7a1f2fb4c809b82bed6b0242a2a3bcfa2c5276ebd2539ff330fee36f8fe18.vtl` — if( $ctx.error ) (~94 tok)
- `asset.4c6a2d29f01c6091bd1d9afe16e5849d456c96f17c3b215938c8067399532719.vtl` — # [Start] Get Response template. ** (~102 tok)
- `asset.4f7907d1209a2c9953a0c053df402c634e359546d70c7cc5c2e8e21ea734880f.vtl` — # [Start] Delete Request template. ** (~493 tok)
- `asset.5206157ed7867c8027c62c19be360247ef34834ed7d44ddc104730d0cc803b79.vtl` — if( $ctx.stash.deniedField ) (~520 tok)
- `asset.530adcefd87d75e21527ec766de1959420d88c5ea3eca5e4ddc801e8de45d83b.vtl` — if( $ctx.stash.deniedField ) (~230 tok)
- `asset.5f9325ebc33eb5fb242ff1a3160ffd93aee2f503bca6a6c9f4ad129760ce1123.vtl` — # [Start] Authorization Steps. ** (~747 tok)
- `asset.68d2037655e3a63d1a9c4e8c85daf68671cc29f9ff766217b9fcc598887c6ad2.vtl` — # [Start] Create Request template. ** (~599 tok)
- `asset.6ae80345c27f9e79047c5805f9bd026742e9541e92f4e209e0bb4923f6111122.graphql` — GraphQL: types: Category, CreditCard, MonthlyData, Income (~5705 tok)
- `asset.6b25c9b572c67e0f7ad41cb8019a90825f3db4b02a0a15b837c7a82dcb302060.vtl` — # [Start] Authorization Steps. ** (~484 tok)
- `asset.77425c64c246af0e8c59996b1759e15e54ff2b916c191705b2fad81ba3753ba4.vtl` — # [Start] Authorization Steps. ** (~713 tok)
- `asset.867fb7d7eb8e4127b6d0136b82c5c3f74a52eb410297086859986f8e7e4b02aa.vtl` — # [Start] Authorization Steps. ** (~413 tok)
- `asset.8743e5b0249668b33cf9050ff842b12c715be4661ad92d2bddd3e77cb44d98e4.vtl` — # [Start] Authorization Steps. ** (~710 tok)
- `asset.97ab1fb7f7bd4c3f918842604ca1ae6a7cb114df258c9e4fa0f3eb4e5339cb8a.vtl` — # [Start] Authorization Steps. ** (~751 tok)
- `asset.9fcbe070ecd3023c5bf5b966fa9584757db9762eef123bad0820bd87591b2174.vtl` — # [Start] List Request. ** (~479 tok)
- `asset.a183ddccbd956316c38ef97177b8f088ef0826f62023323f5ae6053d348ccffc.vtl` — # [Start] Initialization default values. ** (~127 tok)
- `asset.af13c36d3940aff38fc2fae1ebd5af3597efc9b77e66336be78d45431fc75fa5.vtl` — if( $ctx.stash.deniedField ) (~520 tok)
- `asset.b74d6a5aa8611ebead30a6aa8d58b61683e6d65c01e3b82cc2f6244beb8afc4e.vtl` — # [Start] Setting "order" to default value of "0". ** (~54 tok)
- `asset.c1721bcd774e27c514d3454b5be4f9bdd094c0161b57ddf053d618e3b0086a77.vtl` — # [Start] Sandbox Mode Disabled, IAM Access Enabled. ** (~101 tok)
- `asset.c8f7517714236f8de8180682bb28062727e614cc192ba0277210a71c8e285571.vtl` — # [Start] Authorization Steps. ** (~811 tok)
- `asset.cc01911d0269d4080ea57505dc445dfc315ef7ad85d3d9d4ea1357858bff451d.vtl` — # [Start] ResponseTemplate. ** (~46 tok)
- `asset.d228936eb3dadca7581e390486d1c593bf28e09c2411efdce7f728e0c30f0dfd.vtl` — # [Start] Authorization Steps. ** (~710 tok)
- `asset.d278223147c1222c5beddd70dc465db3bc205849b458499722f2a1c10ab901ec.vtl` — # [Start] Create Request template. ** (~599 tok)
- `asset.d69b10e051dd29f8ab942904290efd9f228b6a9e56341eeffd114ba5d0ab80b2.vtl` — # [Start] Setting "investments" to default value of "0". ** (~115 tok)
- `asset.d93611dca70c178d77b1a4c37d837804654d130af6ed41494edf2a38dd838ce6.vtl` — # [Start] Check if subscriptions is protected. ** (~538 tok)
- `asset.d98000392a5e5baccac30e4c051b151ac9ed510a6e9002113909a23cd617fd1b.vtl` — if( $ctx.stash.deniedField ) (~230 tok)
- `asset.dcb70e4856bc9a423e02b8b9e9c2ab3f71479784572d4c04a02d1f5b61a9f9ac.vtl` — if( $ctx.error ) (~148 tok)
- `asset.e0cff47fb007f0bbf2a4e43ca256d6aa7ec109821769fd79fa7c5e83f0e7f9fc.vtl` — # [Start] Subscription Response template. ** (~67 tok)
- `asset.e61e0890c9b2c915d3415f4f5aa1e885fe39a6c816270b92f75753773a0668f2.vtl` — if( $ctx.stash.deniedField ) (~519 tok)
- `asset.e90bb23a6ffad9d2f2eab20d639343341571b9ee35597de7f19a744ebe44db28.vtl` — # [Start] Authorization Steps. ** (~721 tok)
- `asset.ebe39f0d385ca7747fe0cc17b587d5360e4714c4a16aac1e2115f5e81c8bed81.vtl` — # [Start] Create Request template. ** (~598 tok)
- `asset.f4a52b72209a9dfa197b5e7367a5c378c5bb86de6e29ddd9e48b49a3fe54b249.vtl` — # [Start] ResponseTemplate. ** (~60 tok)
- `asset.fdb3eab04bf5334e10f336b071027e1aaf8e13bf375a44bd6d9c082352a6da9b.vtl` — # [Start] Authorization Steps. ** (~753 tok)
- `asset.fe3c43ada4b9d681a5e2312663ef7a73386424d73b73e51f8e2e9d4b50f7c502.vtl` — # [Start] Subscription Request template. ** (~40 tok)
- `cdk.out` (~6 tok)
- `manifest.json` (~67849 tok)
- `tree.json` (~249351 tok)

## .amplify/artifacts/cdk.out/asset.07a90cc3efdfc34da22208dcd9d211f06f5b0e01b21e778edc7c3966b1f61d57/

- `cfn-response.js` — url: submitResponse, safeHandler, redactDataFromPayload (~772 tok)
- `consts.js` (~196 tok)
- `framework.js` — cfnResponse: onEvent, isComplete, onTimeout + 3 more (~1313 tok)
- `outbound.js` — https: defaultHttpRequest, defaultStartExecution, defaultInvokeFunction (~369 tok)
- `util.js` — getEnv: log, withRetries, sleep, parseJsonPayload (~282 tok)

## .amplify/artifacts/cdk.out/asset.3423a042b818e31c1e34a19d6689ab2e5f9b70fcbe9e71df66f241b20a200bd9/

- `index.py` — handler, cfn_error, sanitize_message, s3_deploy + 3 more (~4947 tok)
  - fn `handler` L38-159 (~1783 tok)
  - fn `sanitize_message` L160-173 (~152 tok)
  - fn `s3_deploy` L174-233 (~693 tok)
  - fn `cloudfront_invalidate` L234-260 (~339 tok)
  - fn `create_metadata_args` L261-278 (~264 tok)
  - fn `aws_command` L279-285 (~86 tok)
  - fn `cfn_send` L286-319 (~400 tok)
  - fn `bucket_owned` L320-334 (~140 tok)
  - fn `extract_and_replace_markers` L335-344 (~117 tok)
  - fn `prepare_json_safe_markers` L345-357 (~168 tok)
  - fn `replace_markers` L358-382 (~280 tok)
  - fn `replace_markers_in_json` L383-407 (~300 tok)

## .amplify/artifacts/cdk.out/asset.4dadba439767e319a75e68c56b09dcfc19a40f0355ace48b28d600b7aac34e79/

- `model-schema.graphql` — GraphQL: types: Category, CreditCard, MonthlyData, Income (~494 tok)

## .amplify/artifacts/cdk.out/asset.6b3a2ea84b5b5979c168000d74b93600f6a826622343b4459ee77c1c3b74ffba/

- `modelIntrospectionSchema.json` (~7334 tok)

## .amplify/artifacts/cdk.out/asset.a096c064c4168f72aef670ba24ebcef8ca03f2864809e732fc70cd5520c55bc7/

- `index.js` — Convert a stack name to a BackendIdentifier (~209255 tok)

## .amplify/artifacts/cdk.out/asset.f2c5bec0e463cae18d0bf683be5923ae6bd676a06af1a994bdfa076a66ac07d6/

- `amplify-table-manager-handler.d.ts.map` (~423 tok)
- `amplify-table-manager-handler.js` — client_dynamodb_1: onEventHandler, isCompleteHandler (~13212 tok)
  - fn `getLambdaTags` L43-58 (~155 tok)
  - fn `getTableTags` L59-64 (~77 tok)
  - fn `onEventHandler` L65-88 (~319 tok)
  - fn `isCompleteHandler` L89-109 (~248 tok)
  - fn `processOnEvent` L110-281 (~2855 tok)
  - fn `processIsComplete` L282-344 (~919 tok)
  - fn `replaceTable` L345-367 (~297 tok)
  - fn `createResponseEvent` L368-382 (~247 tok)
  - fn `defaultPhysicalResourceId` L383-393 (~97 tok)
  - fn `getNextAtomicUpdate` L394-436 (~895 tok)
  - fn `getNextGSIUpdate` L437-531 (~1425 tok)
  - fn `getStreamUpdate` L532-561 (~526 tok)
  - fn `getSseUpdate` L562-598 (~392 tok)
  - fn `requiresTagsUpdate` L599-619 (~198 tok)
  - fn `getDeletionProtectionUpdate` L620-635 (~200 tok)
  - fn `getTtlUpdate` L636-671 (~383 tok)
  - fn `getPointInTimeRecoveryUpdate` L672-701 (~326 tok)
  - fn `extractTableInputFromEvent` L702-712 (~134 tok)
  - fn `extractOldTableInputFromEvent` L713-719 (~94 tok)
  - fn `parsePropertiesToDynamoDBInput` L720-722 (~36 tok)
  - fn `usePascalCaseForObjectKeys` L723-741 (~209 tok)
  - fn `convertStringToBooleanOrNumber` L742-770 (~314 tok)
  - fn `removeUndefinedAttributes` L771-784 (~115 tok)
  - fn `toCreateTableInput` L785-805 (~260 tok)
  - fn `createNewTable` L806-812 (~108 tok)
  - fn `doesTableExist` L813-824 (~89 tok)
  - fn `isTableReady` L825-837 (~161 tok)
  - fn `isProjectionModified` L838-850 (~184 tok)
  - fn `isKeySchemaModified` L851-865 (~307 tok)
  - fn `getTypeModifiedAttributes` L866-954 (~1028 tok)
- `amplify-table-manager-handler.js.map` (~8962 tok)
- `cfn-response.d.ts.map` (~222 tok)
- `cfn-response.js` — url: submitResponse, safeHandler (~1136 tok)
  - fn `submitResponse` L32-60 (~293 tok)
  - fn `safeHandler` L61-91 (~366 tok)
  - class `Retry` L92-95 (~27 tok)
- `cfn-response.js.map` (~565 tok)
- `import-table.d.ts.map` (~191 tok)
- `import-table.js` — Declares lodash_isequal_1 (~3351 tok)
  - fn `importTable` L9-32 (~360 tok)
  - fn `validateImportedTableProperties` L33-54 (~586 tok)
  - fn `getExpectedTableProperties` L55-67 (~220 tok)
  - fn `getExpectedAttributeDefinitions` L68-70 (~34 tok)
  - fn `getExpectedKeySchema` L71-73 (~27 tok)
  - fn `getExpectedGlobalSecondaryIndexes` L74-90 (~170 tok)
  - fn `getExpectedBillingModeSummary` L91-95 (~39 tok)
  - fn `getExpectedStreamSpecification` L96-98 (~33 tok)
  - fn `getExpectedProvisionedThroughput` L99-101 (~49 tok)
  - fn `getExpectedSSEDescription` L102-109 (~85 tok)
  - fn `getExpectedDeletionProtectionEnabled` L110-112 (~39 tok)
  - fn `getImportedTableComparisonProperties` L113-125 (~233 tok)
  - fn `getAttributeDefinitionsForComparison` L126-132 (~95 tok)
  - fn `getKeySchemaForComparison` L133-139 (~71 tok)
  - fn `getGlobalSecondaryIndexesForComparison` L140-170 (~379 tok)
  - fn `getBillingModeSummaryForComparison` L171-177 (~64 tok)
  - fn `getProvisionedThroughputForComparison` L178-185 (~96 tok)
  - fn `getStreamSpecificationForComparison` L186-194 (~120 tok)
  - fn `getSSEDescriptionForComparison` L195-201 (~59 tok)
  - fn `getDeletionProtectionEnabledForComparison` L202-204 (~36 tok)
  - fn `sanitizeTableProperties` L205-225 (~406 tok)
- `import-table.js.map` (~2118 tok)
- `outbound.d.ts.map` (~130 tok)
- `outbound.js` — https: defaultHttpRequest, defaultStartExecution (~582 tok)
  - fn `defaultHttpRequest` L33-46 (~106 tok)
  - fn `defaultStartExecution` L47-55 (~80 tok)
- `outbound.js.map` (~261 tok)
- `util.d.ts.map` (~155 tok)
- `util.js` — getEnv: withRetries, sleep (~349 tok)
- `util.js.map` (~356 tok)

## .amplify/artifacts/cdk.out/asset.faa95a81ae7d7373f3e1f242268f904eb748d8d0fdd306e8a6fe515a1905a7d6/

- `index.js` — R: k, u, D + 9 more (~1258 tok)

## .amplify/generated/env/

- `accept-invite.ts` — This stub exists for local TypeScript compilation only. (~126 tok)
- `create-workspace.ts` — This stub exists for local TypeScript compilation only. (~126 tok)
- `generate-invite-code.ts` — This stub exists for local TypeScript compilation only. (~126 tok)

## .claude/

- `settings.json` (~514 tok)
- `settings.local.json` (~152 tok)

## .claude/commands/

- `reframe.md` — Mode: migrate [framework] (~551 tok)
- `security-audit.md` — Layer 1 — Dependencies (~510 tok)

## .claude/rules/

- `openwolf.md` (~328 tok)

## .codex/

- `config.toml` (~7 tok)
- `hooks.json` (~655 tok)

## .codex/prompts/

- `reframe.md` — Mode: migrate [framework] (~551 tok)
- `security-audit.md` — Layer 1 — Dependencies (~510 tok)

## .github/

- `pull_request_template.md` — Summary (~220 tok)

## .github/ISSUE_TEMPLATE/

- `bug_report.yml` (~238 tok)
- `config.yml` (~8 tok)
- `feature_request.yml` (~195 tok)

## .github/workflows/

- `e2e.yml` — CI: E2E (~277 tok)
- `quality.yml` — CI: Quality (~217 tok)
- `test.yml` — CI: Tests (~191 tok)

## .husky/

- `pre-commit` (~5 tok)
- `pre-push` — Verify lock file is in sync with package.json (catches npm ci failures before they hit CI) (~127 tok)

## .husky/_/

- `.gitignore` — Git ignore rules (~1 tok)
- `applypatch-msg` (~11 tok)
- `commit-msg` (~11 tok)
- `h` (~147 tok)
- `husky.sh` (~46 tok)
- `post-applypatch` (~11 tok)
- `post-checkout` (~11 tok)
- `post-commit` (~11 tok)
- `post-merge` (~11 tok)
- `post-rewrite` (~11 tok)
- `pre-applypatch` (~11 tok)
- `pre-auto-gc` (~11 tok)
- `pre-commit` (~11 tok)
- `pre-merge-commit` (~11 tok)
- `pre-push` (~11 tok)
- `pre-rebase` (~11 tok)
- `prepare-commit-msg` (~11 tok)

## .opencode/command/

- `reframe.md` — Mode: migrate [framework] (~551 tok)
- `security-audit.md` — Layer 1 — Dependencies (~510 tok)

## .opencode/plugin/

- `openwolf.ts` — OpenWolf plugin entry — installed by `openwolf init --agent opencode`. (~74 tok)

## .opencode/plugin/openwolf/

- `anatomy.ts` — Exports parseAnatomy, serializeAnatomy, extractDescription, STORE_FILE + 12 more (~2922 tok)
  - fn `parseAnatomy` L5-28 (~207 tok)
  - fn `serializeAnatomy` L29-53 (~240 tok)
  - fn `extractDescription` L54-106 (~577 tok)
  - fn `sha256` L107-110 (~33 tok)
  - section `StoreFileEntry` L111-121 (~83 tok)
  - section `AnatomyStoreData` L122-127 (~63 tok)
  - fn `newStore` L128-132 (~64 tok)
  - fn `loadStore` L133-142 (~92 tok)
  - fn `saveStore` L143-157 (~162 tok)
  - fn `renderStore` L158-188 (~380 tok)
  - fn `renderToFile` L189-202 (~146 tok)
  - fn `importFromMarkdown` L203-227 (~305 tok)
  - fn `loadStoreReconciled` L228-240 (~137 tok)
  - fn `lockSleep` L241-244 (~31 tok)
  - fn `withAnatomyLock` L245-276 (~373 tok)
- `fs.ts` — Exports getWolfDir, wolfDirExists, readJSON, writeJSON + 6 more (~538 tok)
  - fn `getWolfDir` L5-8 (~28 tok)
  - fn `wolfDirExists` L9-12 (~31 tok)
  - fn `readJSON` L13-20 (~50 tok)
  - fn `writeJSON` L21-33 (~144 tok)
  - fn `readMarkdown` L34-41 (~41 tok)
  - fn `appendMarkdown` L42-47 (~64 tok)
  - fn `timeShort` L48-52 (~46 tok)
  - fn `timestamp` L53-56 (~22 tok)
  - fn `normalizePath` L57-60 (~24 tok)
  - fn `estimateTokens` L61-64 (~60 tok)
- `index.ts` — Exports OpenWolf (~1081 tok)
- `post-read.ts` — Exports handlePostRead (~629 tok)
  - fn `handlePostRead` L7-57 (~553 tok)
- `post-write.ts` — Exports handlePostWrite, summarizeEdit, autoDetectBugFix, detectFixPattern (~3226 tok)
  - fn `handlePostWrite` L8-39 (~302 tok)
  - fn `updateAnatomy` L40-86 (~473 tok)
  - fn `appendToMemory` L87-114 (~302 tok)
  - fn `trackSession` L115-150 (~338 tok)
  - fn `summarizeEdit` L151-184 (~471 tok)
  - fn `autoDetectBugFix` L185-228 (~523 tok)
  - fn `detectFixPattern` L229-265 (~610 tok)
  - fn `extractChangedLines` L266-270 (~88 tok)
- `pre-read.ts` — Exports handlePreRead (~685 tok)
  - fn `handlePreRead` L7-63 (~613 tok)
- `pre-write.ts` — Exports handlePreWrite (~1167 tok)
  - fn `tokenize` L14-21 (~63 tok)
  - fn `handlePreWrite` L22-35 (~132 tok)
  - fn `checkCerebrum` L36-65 (~369 tok)
  - section `BugEntry` L66-74 (~37 tok)
  - fn `checkBugLog` L75-105 (~399 tok)
- `session.ts` — Exports getSessionState, setSessionState, deleteSession, handleSessionStart (~952 tok)
  - fn `getSessionState` L8-11 (~33 tok)
  - fn `setSessionState` L12-15 (~33 tok)
  - fn `deleteSession` L16-19 (~26 tok)
  - fn `handleSessionStart` L20-89 (~783 tok)
- `stop.ts` — Exports handleStop (~1444 tok)
  - fn `handleStop` L6-35 (~262 tok)
  - fn `checkForMissingBugLogs` L36-50 (~165 tok)
  - fn `buildLedgerEntry` L51-114 (~743 tok)
  - fn `appendSessionSummary` L115-126 (~218 tok)
- `types.ts` — Exports FileRead, FileWrite, SessionState, PartialSessionState + 2 more (~217 tok)

## .serena/

- `.gitignore` — Git ignore rules (~2 tok)
- `project.yml` — the name by which the project can be referenced within Serena/when chatting with the LLM. (~2751 tok)

## .serena/cache/typescript/

- `raw_document_symbols.pkl` (~206296 tok)

## __tests__/

- `test-utils.tsx` — Mock messages for testing - Portuguese (pt) to match test expectations (~713 tok)
  - section `AllTheProvidersProps` L70-75 (~34 tok)
  - fn `AllTheProviders` L76-87 (~69 tok)
  - fn `customRender` L88-112 (~161 tok)

## __tests__/adapters/

- `config.test.ts` — Declares consoleSpy (~611 tok)
- `registry.test.ts` — Registry uses module-level state. vi.resetModules() + dynamic import per describe (~800 tok)

## __tests__/adapters/local/

- `local-storage-adapter.test.ts` — Declares mockSetWorkspace (~3873 tok)
- `no-auth-adapter.test.ts` — Declares adapter (~209 tok)

## __tests__/components/

- `app-shell.test.tsx` — Presentational leaves, not what this test targets (the shadcn Sidebar's Sheet/Tooltip primitives). (~527 tok)
  - fn `mockMatchMedia` L15-65 (~376 tok)
- `expense-edit-dialog.test.tsx` — mockOnSubmit (~3361 tok)

## __tests__/components/expense/

- `month-selector.test.tsx` — mockOnMonthChange (~3514 tok)

## __tests__/store/

- `cloud-sync-branches.test.ts` — Tests that exercise the cloud-sync branches (if workspaceGroup / if workspaceGroup && workspaceId) (~2580 tok)
- `credit-cards.test.ts` — Declares state (~4064 tok)
- `expenses.test.ts` — Declares state (~3833 tok)
- `goals.test.ts` — Declares goalId (~2712 tok)
- `income.test.ts` — Declares monthData (~1734 tok)
- `installments.test.ts` — Declares state (~2744 tok)
- `month-logic.test.ts` — Declares state (~3107 tok)
- `notes.test.ts` — Declares ids (~2017 tok)
- `recurring-expenses.test.ts` — Declares monthData (~4848 tok)
- `savings-entries.test.ts` — Declares monthData (~2237 tok)
- `store-utilities.test.ts` — Declares mockFetchWorkspaceData (~4276 tok)

## __tests__/utils/

- `formatting.test.ts` — Declares groceries (~1666 tok)

## amplify/

- `backend.ts` — Declares backend (~630 tok)
- `package.json` — Node.js package manifest (~7 tok)
- `tsconfig.json` — TypeScript configuration (~96 tok)

## amplify/auth/

- `resource.ts` — Define and configure your auth resource (~187 tok)

## amplify/data/

- `resource.ts` — Tempest - Personal Finance Management Schema (~2564 tok)

## amplify/functions/accept-invite/

- `handler.ts` — Exports handler (~947 tok)
- `resource.ts` — Exports acceptInviteFn (~45 tok)

## amplify/functions/create-workspace/

- `handler.ts` — Exports handler (~1214 tok)
- `resource.ts` — Exports createWorkspaceFn (~46 tok)

## amplify/functions/generate-invite-code/

- `handler.ts` — Exports handler (~756 tok)
- `resource.ts` — Exports generateInviteCodeFn (~48 tok)

## amplify/functions/remove-member/

- `handler.ts` — Exports handler (~618 tok)
- `resource.ts` — Exports removeMemberFn (~43 tok)

## amplify/functions/shared/

- `avatar.ts` — Exports hashAvatarColor (~116 tok)

## app/

- `globals.css` — Styles: 19 rules, 122 vars, 4 animations, 1 layers (~1982 tok)
- `layout.tsx` — inter (~777 tok)
  - fn `generateMetadata` L23-81 (~405 tok)
  - fn `RootLayout` L82-107 (~191 tok)
- `page.tsx` — ExpenseManagementApp (~501 tok)
  - fn `ExpenseManagementApp` L16-43 (~288 tok)

## app/auth/

- `page.tsx` — AuthPageContent — uses useRouter, useSearchParams (~224 tok)

## app/auth/callback/

- `page.tsx` — OAuth Callback Page (~569 tok)
  - fn `CallbackContent` L19-52 (~296 tok)
  - fn `AuthCallbackPage` L53-69 (~127 tok)

## app/brand/

- `page.tsx` — metadata (~95 tok)

## app/invite/[inviteId]/

- `page.tsx` — InvitePage — uses useRouter, useState (~759 tok)
  - fn `InvitePage` L15-78 (~581 tok)

## app/onboarding/

- `page.tsx` — WorkspaceForm — renders form — uses useRouter, useState (~1974 tok)
  - fn `WorkspaceForm` L34-101 (~464 tok)
  - fn `OnboardingPage` L102-227 (~1195 tok)

## app/settings/

- `page.tsx` — SettingsPage — uses useRouter (~324 tok)

## components/

- `amplify-provider.tsx` (~37 tok)
- `theme-provider.tsx` — ThemeProvider (~82 tok)
- `theme-toggle.tsx` — ThemeToggle (~337 tok)

## components/auth/

- `auth-form.tsx` — AuthForm — renders form — uses useState (~2846 tok)
  - fn `AuthForm` L21-292 (~2630 tok)

## components/brand/

- `brand-showcase.tsx` — brandColors (~4350 tok)
  - fn `BrandShowcase` L46-382 (~3795 tok)
  - fn `SectionTitle` L383-396 (~105 tok)
  - fn `BrandValueCard` L397-421 (~157 tok)
- `tempest-logo.tsx` — sizeMap (~1908 tok)
  - section `TempestLogoProps` L5-20 (~132 tok)
  - fn `TempestLogo` L21-195 (~1368 tok)
  - fn `TempestIconMark` L196-247 (~395 tok)

## components/expense/

- `app-shell.tsx` — AppShell (~302 tok)
- `categories-view.tsx` — SortableCategoryCard — uses useState, useMemo (~3005 tok)
  - fn `SortableCategoryCard` L54-162 (~1027 tok)
  - fn `CategoriesView` L163-330 (~1600 tok)
- `category-breakdown.tsx` — CategoryBreakdown (~998 tok)
  - section `CategoryBreakdownProps` L15-18 (~17 tok)
  - fn `CategoryBreakdown` L19-94 (~868 tok)
- `category-form-dialog.tsx` — CategoryFormDialog — renders form, modal — uses useState, useEffect (~1350 tok)
  - fn `CategoryFormDialog` L30-149 (~1100 tok)
- `color-selector.tsx` — ColorSelector (~403 tok)
- `credit-card-form-dialog.tsx` — CreditCardFormDialog — renders form, modal — uses useState, useEffect (~1656 tok)
  - fn `CreditCardFormDialog` L28-183 (~1447 tok)
- `credit-cards-view.tsx` — SortableCreditCardCard — uses useState, useMemo (~5293 tok)
  - fn `SortableCreditCardCard` L65-174 (~1062 tok)
  - fn `CreditCardsView` L175-500 (~3750 tok)
- `dashboard-skeleton.tsx` — DashboardSkeleton — renders chart (~1026 tok)
  - fn `DashboardSkeleton` L4-91 (~991 tok)
- `dashboard-view.tsx` — DashboardView — renders chart — uses useState, useEffect, useMemo (~9152 tok)
  - fn `DashboardView` L46-718 (~8901 tok)
- `expense-edit-dialog.tsx` — ExpenseEditDialog — renders form, modal — uses useState, useEffect (~1747 tok)
  - section `ExpenseEditDialogProps` L28-36 (~66 tok)
  - fn `ExpenseEditDialog` L37-187 (~1476 tok)
- `expense-form.tsx` — ExpenseForm — renders form, modal — uses useState (~1377 tok)
  - section `ExpenseFormProps` L28-39 (~69 tok)
  - fn `ExpenseForm` L40-150 (~1114 tok)
- `expense-list.tsx` — ExpenseList — renders chart (~1732 tok)
  - section `ExpenseListProps` L16-25 (~76 tok)
  - fn `ExpenseList` L26-150 (~1464 tok)
- `goal-card.tsx` — GoalCard (~1738 tok)
  - section `GoalCardProps` L28-37 (~54 tok)
  - fn `GoalCard` L38-169 (~1458 tok)
- `goal-detail-sheet.tsx` — GoalDetailSheet — uses useState (~2790 tok)
  - section `GoalDetailSheetProps` L33-45 (~97 tok)
  - fn `GoalDetailSheet` L46-257 (~2412 tok)
- `goal-form-dialog.tsx` — GOAL_ICONS — renders form, modal — uses useState, useEffect (~2338 tok)
  - fn `GoalFormDialog` L82-266 (~1905 tok)
- `goal-progress-bar.tsx` — GoalProgressBar (~265 tok)
- `goals-view.tsx` — GoalsView — uses useState (~1780 tok)
  - fn `GoalsView` L13-164 (~1632 tok)
- `icon-selector.tsx` — CATEGORY_ICONS — uses useState (~1214 tok)
  - fn `IconSelector` L103-176 (~759 tok)
- `income-input.tsx` — AddIncomeDialog — renders form, modal — uses useState (~2038 tok)
  - section `IncomeSectionProps` L26-37 (~124 tok)
  - fn `AddIncomeDialog` L38-140 (~1006 tok)
  - fn `IncomeSection` L141-210 (~659 tok)
- `income-list.tsx` — IncomeList — renders form, modal — uses useState (~1987 tok)
  - section `IncomeListProps` L22-27 (~42 tok)
  - fn `IncomeList` L28-184 (~1767 tok)
- `installments.tsx` — Installments — renders form, modal — uses useState (~3039 tok)
  - section `InstallmentsProps` L27-31 (~25 tok)
  - fn `Installments` L32-273 (~2811 tok)
- `month-selector.tsx` — MonthSelector (~1182 tok)
  - section `MonthSelectorProps` L14-18 (~28 tok)
  - fn `MonthSelector` L19-133 (~1075 tok)
- `monthly-view.tsx` — MonthlyView — uses useEffect (~2164 tok)
  - fn `MonthlyView` L14-209 (~2013 tok)
- `note-form-dialog.tsx` — NoteFormDialog — renders form, modal — uses useState, useEffect (~1740 tok)
  - section `NoteFormDialogProps` L21-28 (~54 tok)
  - fn `NoteFormDialog` L29-186 (~1514 tok)
- `notes-section.tsx` — NotesSection — uses useState (~2637 tok)
  - section `NotesSectionProps` L25-32 (~70 tok)
  - fn `NotesSection` L33-232 (~2365 tok)
- `savings-entries-section.tsx` — SavingsEntriesSection (~1644 tok)
  - section `SavingsEntriesSectionProps` L13-20 (~57 tok)
  - fn `SavingsEntriesSection` L21-151 (~1454 tok)
- `savings-entry-form-dialog.tsx` — SavingsEntryFormDialog — renders form, modal — uses useState, useEffect (~1870 tok)
  - section `SavingsEntryFormDialogProps` L27-34 (~57 tok)
  - fn `SavingsEntryFormDialog` L35-205 (~1621 tok)
- `settings-view.tsx` — SettingsView — uses useRouter, useState, useEffect (~3696 tok)
  - fn `SettingsView` L36-324 (~3375 tok)
- `sidebar.tsx` — AppSidebar (~1172 tok)
  - fn `AppSidebar` L33-144 (~926 tok)
- `summary-cards.tsx` — SummaryCards (~1308 tok)
  - section `SummaryCardsProps` L18-24 (~40 tok)
  - fn `SummaryCards` L25-145 (~1158 tok)
- `sync-card.tsx` — SyncCard — uses useState, useEffect (~1455 tok)
  - section `SyncCardProps` L13-16 (~15 tok)
  - fn `SyncCard` L17-160 (~1285 tok)
- `year-selector.tsx` — YearSelector (~464 tok)

## components/ui/

- `accordion.tsx` — Accordion (~587 tok)
  - fn `Accordion` L9-14 (~47 tok)
  - fn `AccordionItem` L15-27 (~78 tok)
  - fn `AccordionTrigger` L28-49 (~256 tok)
  - fn `AccordionContent` L50-67 (~152 tok)
- `alert-dialog.tsx` — AlertDialog (~1105 tok)
  - fn `AlertDialog` L9-14 (~50 tok)
  - fn `AlertDialogTrigger` L15-22 (~58 tok)
  - fn `AlertDialogPortal` L23-30 (~57 tok)
  - fn `AlertDialogOverlay` L31-46 (~127 tok)
  - fn `AlertDialogContent` L47-65 (~215 tok)
  - fn `AlertDialogHeader` L66-78 (~73 tok)
  - fn `AlertDialogFooter` L79-94 (~83 tok)
  - fn `AlertDialogTitle` L95-107 (~81 tok)
  - fn `AlertDialogDescription` L108-120 (~90 tok)
  - fn `AlertDialogAction` L121-132 (~69 tok)
  - fn `AlertDialogCancel` L133-158 (~145 tok)
- `alert.tsx` — alertVariants (~462 tok)
- `aspect-ratio.tsx` — AspectRatio (~80 tok)
- `avatar.tsx` — Avatar (~314 tok)
- `badge.tsx` — badgeVariants (~467 tok)
- `breadcrumb.tsx` — Breadcrumb (~674 tok)
  - fn `Breadcrumb` L7-10 (~41 tok)
  - fn `BreadcrumbList` L11-23 (~89 tok)
  - fn `BreadcrumbItem` L24-33 (~66 tok)
  - fn `BreadcrumbLink` L34-51 (~91 tok)
  - fn `BreadcrumbPage` L52-64 (~86 tok)
  - fn `BreadcrumbSeparator` L65-82 (~97 tok)
  - fn `BreadcrumbEllipsis` L83-110 (~156 tok)
- `button-group.tsx` — buttonGroupVariants (~632 tok)
  - fn `ButtonGroup` L24-39 (~99 tok)
  - fn `ButtonGroupText` L40-59 (~124 tok)
  - fn `ButtonGroupSeparator` L60-84 (~138 tok)
- `button.tsx` — buttonVariants (~613 tok)
  - fn `Button` L39-61 (~117 tok)
- `calendar.tsx` — Calendar — uses useEffect (~2194 tok)
  - fn `Calendar` L14-174 (~1592 tok)
  - fn `CalendarDayButton` L175-214 (~513 tok)
- `card.tsx` — Card (~569 tok)
  - fn `Card` L5-17 (~82 tok)
  - fn `CardHeader` L18-30 (~106 tok)
  - fn `CardTitle` L31-40 (~62 tok)
  - fn `CardDescription` L41-50 (~66 tok)
  - fn `CardAction` L51-63 (~80 tok)
  - fn `CardContent` L64-73 (~57 tok)
  - fn `CardFooter` L74-93 (~98 tok)
- `carousel.tsx` — CarouselContext — uses useContext, useState, useCallback, useEffect (~1590 tok)
  - fn `useCarousel` L35-44 (~55 tok)
  - fn `Carousel` L45-134 (~577 tok)
  - fn `CarouselContent` L135-155 (~130 tok)
  - fn `CarouselItem` L156-173 (~116 tok)
  - fn `CarouselPrevious` L174-203 (~204 tok)
  - fn `CarouselNext` L204-242 (~235 tok)
- `chart.tsx` — THEMES — renders chart — uses useContext, useMemo (~2796 tok)
  - fn `useChart` L27-36 (~54 tok)
  - fn `ChartContainer` L37-71 (~412 tok)
  - fn `ChartStyle` L72-106 (~216 tok)
  - fn `ChartTooltipContent` L107-252 (~1278 tok)
  - fn `ChartLegendContent` L253-307 (~381 tok)
  - fn `getPayloadConfigFromPayload` L308-354 (~292 tok)
- `checkbox.tsx` — Checkbox (~351 tok)
- `collapsible.tsx` — Collapsible (~229 tok)
- `command.tsx` — Command — renders modal (~1379 tok)
  - fn `Command` L16-31 (~96 tok)
  - fn `CommandDialog` L32-62 (~330 tok)
  - fn `CommandInput` L63-84 (~178 tok)
  - fn `CommandList` L85-100 (~93 tok)
  - fn `CommandEmpty` L101-112 (~68 tok)
  - fn `CommandGroup` L113-128 (~138 tok)
  - fn `CommandSeparator` L129-141 (~80 tok)
  - fn `CommandItem` L142-157 (~186 tok)
  - fn `CommandShortcut` L158-185 (~127 tok)
- `context-menu.tsx` — ContextMenu (~2367 tok)
  - fn `ContextMenu` L9-14 (~50 tok)
  - fn `ContextMenuTrigger` L15-22 (~58 tok)
  - fn `ContextMenuGroup` L23-30 (~56 tok)
  - fn `ContextMenuPortal` L31-38 (~57 tok)
  - fn `ContextMenuSub` L39-44 (~51 tok)
  - fn `ContextMenuRadioGroup` L45-55 (~67 tok)
  - fn `ContextMenuSubTrigger` L56-79 (~239 tok)
  - fn `ContextMenuSubContent` L80-95 (~228 tok)
  - fn `ContextMenuContent` L96-113 (~270 tok)
  - fn `ContextMenuItem` L114-136 (~300 tok)
  - fn `ContextMenuCheckboxItem` L137-162 (~277 tok)
  - fn `ContextMenuRadioItem` L163-186 (~267 tok)
  - fn `ContextMenuLabel` L187-206 (~117 tok)
  - fn `ContextMenuSeparator` L207-219 (~86 tok)
  - fn `ContextMenuShortcut` L220-253 (~182 tok)
- `dialog.tsx` — Dialog — renders modal (~1139 tok)
  - fn `Dialog` L9-14 (~44 tok)
  - fn `DialogTrigger` L15-20 (~50 tok)
  - fn `DialogPortal` L21-26 (~48 tok)
  - fn `DialogClose` L27-32 (~47 tok)
  - fn `DialogOverlay` L33-48 (~121 tok)
  - fn `DialogContent` L49-82 (~421 tok)
  - fn `DialogHeader` L83-92 (~69 tok)
  - fn `DialogFooter` L93-105 (~79 tok)
  - fn `DialogTitle` L106-118 (~78 tok)
  - fn `DialogDescription` L119-144 (~133 tok)
- `drawer.tsx` — Drawer — renders modal (~1217 tok)
  - fn `Drawer` L8-13 (~44 tok)
  - fn `DrawerTrigger` L14-19 (~50 tok)
  - fn `DrawerPortal` L20-25 (~48 tok)
  - fn `DrawerClose` L26-31 (~47 tok)
  - fn `DrawerOverlay` L32-47 (~121 tok)
  - fn `DrawerContent` L48-74 (~480 tok)
  - fn `DrawerHeader` L75-87 (~116 tok)
  - fn `DrawerFooter` L88-97 (~65 tok)
  - fn `DrawerTitle` L98-110 (~77 tok)
  - fn `DrawerDescription` L111-136 (~133 tok)
- `dropdown-menu.tsx` — DropdownMenu (~2410 tok)
  - fn `DropdownMenu` L9-14 (~51 tok)
  - fn `DropdownMenuPortal` L15-22 (~58 tok)
  - fn `DropdownMenuTrigger` L23-33 (~64 tok)
  - fn `DropdownMenuContent` L34-53 (~286 tok)
  - fn `DropdownMenuGroup` L54-61 (~57 tok)
  - fn `DropdownMenuItem` L62-84 (~301 tok)
  - fn `DropdownMenuCheckboxItem` L85-110 (~279 tok)
  - fn `DropdownMenuRadioGroup` L111-121 (~68 tok)
  - fn `DropdownMenuRadioItem` L122-145 (~269 tok)
  - fn `DropdownMenuLabel` L146-165 (~114 tok)
  - fn `DropdownMenuSeparator` L166-178 (~88 tok)
  - fn `DropdownMenuShortcut` L179-194 (~85 tok)
  - fn `DropdownMenuSub` L195-200 (~52 tok)
  - fn `DropdownMenuSubTrigger` L201-224 (~244 tok)
  - fn `DropdownMenuSubContent` L225-258 (~332 tok)
- `empty.tsx` — Empty (~686 tok)
  - fn `Empty` L5-17 (~95 tok)
  - fn `EmptyHeader` L18-45 (~198 tok)
  - fn `EmptyMedia` L46-60 (~91 tok)
  - fn `EmptyTitle` L61-70 (~65 tok)
  - fn `EmptyDescription` L71-83 (~95 tok)
  - fn `EmptyContent` L84-105 (~114 tok)
- `field.tsx` — FieldSet — uses useMemo (~1730 tok)
  - fn `FieldSet` L10-23 (~95 tok)
  - fn `FieldLegend` L24-43 (~119 tok)
  - fn `FieldGroup` L44-80 (~369 tok)
  - fn `Field` L81-96 (~96 tok)
  - fn `FieldContent` L97-109 (~81 tok)
  - fn `FieldLabel` L110-127 (~184 tok)
  - fn `FieldTitle` L128-140 (~93 tok)
  - fn `FieldDescription` L141-155 (~141 tok)
  - fn `FieldSeparator` L156-185 (~194 tok)
  - fn `FieldError` L186-245 (~290 tok)
- `form.tsx` — Form — renders form — uses useContext (~1075 tok)
  - fn `useFormField` L45-75 (~228 tok)
  - fn `FormItem` L76-89 (~90 tok)
  - fn `FormLabel` L90-106 (~101 tok)
  - fn `FormControl` L107-124 (~121 tok)
  - fn `FormDescription` L125-137 (~87 tok)
  - fn `FormMessage` L138-168 (~154 tok)
- `hover-card.tsx` — HoverCard (~438 tok)
- `input-group.tsx` — InputGroup (~1438 tok)
  - fn `InputGroup` L10-58 (~622 tok)
  - fn `InputGroupAddon` L59-98 (~304 tok)
  - fn `InputGroupButton` L99-117 (~114 tok)
  - fn `InputGroupText` L118-129 (~89 tok)
  - fn `InputGroupInput` L130-145 (~96 tok)
  - fn `InputGroupTextarea` L146-170 (~139 tok)
- `input-otp.tsx` — InputOTP — uses useContext (~645 tok)
  - fn `InputOTP` L9-28 (~120 tok)
  - fn `InputOTPGroup` L29-38 (~62 tok)
  - fn `InputOTPSlot` L39-68 (~339 tok)
  - fn `InputOTPSeparator` L69-78 (~74 tok)
- `input.tsx` — Input (~276 tok)
- `item.tsx` — ItemGroup (~1287 tok)
  - fn `ItemGroup` L8-18 (~68 tok)
  - fn `ItemSeparator` L19-53 (~247 tok)
  - fn `Item` L54-90 (~286 tok)
  - fn `ItemMedia` L91-105 (~90 tok)
  - fn `ItemContent` L106-118 (~82 tok)
  - fn `ItemTitle` L119-131 (~80 tok)
  - fn `ItemDescription` L132-145 (~110 tok)
  - fn `ItemActions` L146-155 (~62 tok)
  - fn `ItemHeader` L156-168 (~77 tok)
  - fn `ItemFooter` L169-194 (~120 tok)
- `kbd.tsx` — Kbd (~247 tok)
- `label.tsx` — Label (~175 tok)
- `menubar.tsx` — Menubar (~2402 tok)
  - fn `Menubar` L9-24 (~94 tok)
  - fn `MenubarMenu` L25-30 (~47 tok)
  - fn `MenubarGroup` L31-36 (~48 tok)
  - fn `MenubarPortal` L37-42 (~50 tok)
  - fn `MenubarRadioGroup` L43-50 (~57 tok)
  - fn `MenubarTrigger` L51-66 (~136 tok)
  - fn `MenubarContent` L67-90 (~267 tok)
  - fn `MenubarItem` L91-113 (~295 tok)
  - fn `MenubarCheckboxItem` L114-139 (~269 tok)
  - fn `MenubarRadioItem` L140-163 (~259 tok)
  - fn `MenubarLabel` L164-183 (~108 tok)
  - fn `MenubarSeparator` L184-196 (~82 tok)
  - fn `MenubarShortcut` L197-212 (~82 tok)
  - fn `MenubarSub` L213-218 (~46 tok)
  - fn `MenubarSubTrigger` L219-242 (~196 tok)
  - fn `MenubarSubContent` L243-277 (~307 tok)
- `navigation-menu.tsx` — NavigationMenu (~1901 tok)
  - fn `NavigationMenu` L8-31 (~158 tok)
  - fn `NavigationMenuList` L32-47 (~102 tok)
  - fn `NavigationMenuItem` L48-64 (~238 tok)
  - fn `NavigationMenuTrigger` L65-84 (~159 tok)
  - fn `NavigationMenuContent` L85-101 (~491 tok)
  - fn `NavigationMenuViewport` L102-121 (~220 tok)
  - fn `NavigationMenuLink` L122-137 (~218 tok)
  - fn `NavigationMenuIndicator` L138-167 (~248 tok)
- `pagination.tsx` — Pagination (~776 tok)
  - fn `Pagination` L11-22 (~80 tok)
  - fn `PaginationContent` L23-35 (~69 tok)
  - fn `PaginationItem` L36-44 (~75 tok)
  - fn `PaginationLink` L45-67 (~120 tok)
  - fn `PaginationPrevious` L68-84 (~111 tok)
  - fn `PaginationNext` L85-101 (~108 tok)
  - fn `PaginationEllipsis` L102-128 (~150 tok)
- `popover.tsx` — Popover (~468 tok)
- `progress.tsx` — Progress (~212 tok)
- `radio-group.tsx` — RadioGroup (~420 tok)
- `resizable.tsx` — ResizablePanelGroup (~580 tok)
  - fn `ResizablePanelGroup` L9-24 (~104 tok)
  - fn `ResizablePanel` L25-30 (~51 tok)
  - fn `ResizableHandle` L31-57 (~372 tok)
- `scroll-area.tsx` — ScrollArea (~471 tok)
- `select.tsx` — Select (~1789 tok)
  - fn `Select` L9-14 (~44 tok)
  - fn `SelectGroup` L15-20 (~47 tok)
  - fn `SelectValue` L21-26 (~47 tok)
  - fn `SelectTrigger` L27-52 (~384 tok)
  - fn `SelectContent` L53-87 (~445 tok)
  - fn `SelectLabel` L88-100 (~80 tok)
  - fn `SelectItem` L101-124 (~291 tok)
  - fn `SelectSeparator` L125-137 (~86 tok)
  - fn `SelectScrollUpButton` L138-155 (~124 tok)
  - fn `SelectScrollDownButton` L156-186 (~180 tok)
- `separator.tsx` — Separator (~200 tok)
- `sheet.tsx` — Sheet (~1170 tok)
  - fn `Sheet` L9-12 (~42 tok)
  - fn `SheetTrigger` L13-18 (~48 tok)
  - fn `SheetClose` L19-24 (~46 tok)
  - fn `SheetPortal` L25-30 (~47 tok)
  - fn `SheetOverlay` L31-46 (~120 tok)
  - fn `SheetContent` L47-83 (~494 tok)
  - fn `SheetHeader` L84-93 (~63 tok)
  - fn `SheetFooter` L94-103 (~65 tok)
  - fn `SheetTitle` L104-116 (~76 tok)
  - fn `SheetDescription` L117-140 (~120 tok)
- `sidebar.tsx` — SIDEBAR_COOKIE_NAME — uses useContext, useState, useCallback, useEffect (~6186 tok)
  - fn `useSidebar` L47-55 (~55 tok)
  - fn `SidebarProvider` L56-153 (~813 tok)
  - fn `Sidebar` L154-255 (~1006 tok)
  - fn `SidebarTrigger` L256-281 (~149 tok)
  - fn `SidebarRail` L282-306 (~332 tok)
  - fn `SidebarInset` L307-320 (~141 tok)
  - fn `SidebarInput` L321-334 (~78 tok)
  - fn `SidebarHeader` L335-345 (~72 tok)
  - fn `SidebarFooter` L346-356 (~72 tok)
  - fn `SidebarSeparator` L357-370 (~82 tok)
  - fn `SidebarContent` L371-384 (~100 tok)
  - fn `SidebarGroup` L385-395 (~76 tok)
  - fn `SidebarGroupLabel` L396-416 (~192 tok)
  - fn `SidebarGroupAction` L417-439 (~231 tok)
  - fn `SidebarGroupContent` L440-453 (~76 tok)
  - fn `SidebarMenu` L454-464 (~72 tok)
  - fn `SidebarMenuItem` L465-497 (~482 tok)
  - fn `SidebarMenuButton` L498-547 (~305 tok)
  - fn `SidebarMenuAction` L548-579 (~367 tok)
  - fn `SidebarMenuBadge` L580-601 (~220 tok)
  - fn `SidebarMenuSkeleton` L602-639 (~248 tok)
  - fn `SidebarMenuSub` L640-654 (~114 tok)
  - fn `SidebarMenuSubItem` L655-668 (~79 tok)
  - fn `SidebarMenuSubButton` L669-727 (~474 tok)
- `skeleton.tsx` — Skeleton (~79 tok)
- `slider.tsx` — Slider — uses useMemo (~569 tok)
  - fn `Slider` L8-64 (~530 tok)
- `sonner.tsx` — Toaster (~162 tok)
- `spinner.tsx` — Spinner (~95 tok)
- `switch.tsx` — Switch (~336 tok)
- `table.tsx` — Table — renders table (~701 tok)
  - fn `Table` L7-21 (~96 tok)
  - fn `TableHeader` L22-31 (~61 tok)
  - fn `TableBody` L32-41 (~63 tok)
  - fn `TableFooter` L42-54 (~80 tok)
  - fn `TableRow` L55-67 (~82 tok)
  - fn `TableHead` L68-80 (~103 tok)
  - fn `TableCell` L81-93 (~90 tok)
  - fn `TableCaption` L94-117 (~103 tok)
- `tabs.tsx` — Tabs (~564 tok)
  - fn `Tabs` L8-20 (~68 tok)
  - fn `TabsList` L21-36 (~101 tok)
  - fn `TabsTrigger` L37-52 (~268 tok)
  - fn `TabsContent` L53-67 (~89 tok)
- `textarea.tsx` — Textarea (~218 tok)
- `toast.tsx` — ToastProvider (~1390 tok)
- `toaster.tsx` — Toaster (~225 tok)
- `toggle-group.tsx` — ToggleGroupContext — uses useContext (~551 tok)
  - fn `ToggleGroup` L17-42 (~181 tok)
  - fn `ToggleGroupItem` L43-74 (~256 tok)
- `toggle.tsx` — toggleVariants (~449 tok)
- `tooltip.tsx` — TooltipProvider (~541 tok)
  - fn `TooltipProvider` L8-20 (~76 tok)
  - fn `Tooltip` L21-30 (~61 tok)
  - fn `TooltipTrigger` L31-36 (~51 tok)
  - fn `TooltipContent` L37-62 (~314 tok)
- `use-mobile.tsx` — MOBILE_BREAKPOINT — uses useEffect (~162 tok)
- `use-toast.ts` — Exports reducer (~1128 tok)
  - fn `genId` L27-51 (~138 tok)
  - section `State` L52-57 (~34 tok)
  - fn `addToRemoveQueue` L58-132 (~482 tok)
  - fn `dispatch` L133-141 (~54 tok)
  - fn `toast` L142-170 (~140 tok)
  - fn `useToast` L171-192 (~128 tok)

## components/workspace/

- `invite-dialog.tsx` — InviteDialog — renders modal — uses useState, useEffect (~997 tok)
  - fn `InviteDialog` L20-106 (~806 tok)
- `members-list.tsx` — Avatar — uses useState, useEffect (~1635 tok)
  - fn `Avatar` L30-46 (~127 tok)
  - fn `MembersList` L47-180 (~1286 tok)
- `workspace-gate.tsx` — WorkspaceGate — uses useState, useRouter, useEffect (~400 tok)

## docs/

- `e2e-best-practices.md` — Diretrizes e Boas Práticas para Testes E2E (Playwright) (~680 tok)
- `migration-cloud-workspace.md` — Plano de Migração: Cloud-Only + Workspace (~3112 tok)

## docs/migration/

> Guide for rebuilding Tempest as a new clean open-source app (new brand, same features).
> Written for AI-executed incremental migration. Entry point is README.md.

- `README.md` — Index, the three rules, per-session protocol. Read first, every session (~1105 tok)
- `01-target-architecture.md` — 7 ADRs: Vite+React SPA over Next.js, views→routes, local-first
  with no cloud abstraction, store split by domain, money as integer cents, enforced i18n,
  OSS day zero. Includes dependency keep/add/drop table (~3576 tok)
- `02-feature-inventory.md` — 15 features (F-01..F-15) with behaviour, edge cases, required
  changes, old-code refs and pitfall links. F-15 (cloud) is deferred (~5337 tok)
- `03-domain-model.md` — Canonical types, branded primitives, rule-based recurrence model,
  store shape, 10 invariants, old→new import map incl. recurrence reconstruction (~2634 tok)
- `04-pitfalls.md` — 24 verified defects (P-01..P-24) with evidence, line refs and required
  behaviour. P-13/P-21/P-10 are live wrong-number bugs (~5365 tok)
- `05-phase-plan.md` — Living state. Phases 0-10, dependency order, per-phase checklists and
  exit criteria. Phase 10 (cloud) blocked pending design doc (~3085 tok)
- `06-quality-bar.md` — Definition of done, test layers, pitfall regression tests, i18n and UI
  rules, PR checklist, anti-pattern table (~2208 tok)
- `07-agent-tooling.md` — Agent toolchain for the new repo, organised as "a skill advises, a
  hook enforces". 5 layers: enforcement (hooks/lint/CI), context+tasks (OpenWolf, kanban-md,
  Ponytail), design-system enforcement, visual verification (Playwright MCP), TDD policy
  (TDD in domain/, test-after in UI). Includes a what-NOT-to-install list (~2400 tok)

## e2e/

- `credit-cards.spec.ts` — Declares toRemove (~3779 tok)
- `dashboard.spec.ts` — Declares yearSelector (~1765 tok)
- `expenses.spec.ts` — Declares addButton (~1498 tok)
- `income-replication.spec.ts` — Declares row (~1252 tok)
- `navigation.spec.ts` — Declares yearSelector (~1200 tok)

## e2e/setup/

- `storage-state.json` (~1044 tok)

## hooks/

- `use-mobile.ts` — Exports useIsMobile (~162 tok)
- `use-toast.ts` — Exports reducer (~1122 tok)
  - fn `genId` L27-51 (~138 tok)
  - section `State` L52-57 (~34 tok)
  - fn `addToRemoveQueue` L58-130 (~477 tok)
  - fn `dispatch` L131-139 (~54 tok)
  - fn `toast` L140-168 (~140 tok)
  - fn `useToast` L169-190 (~128 tok)

## i18n/

- `request.ts` — API routes: GET (2 endpoints) (~219 tok)
- `routing.ts` — Exports routing (~165 tok)

## lib/

- `amplify-config.ts` — Configure AWS Amplify for client-side usage (~346 tok)
- `expense-store.ts` — Exports CategoryIcon, Category, ExpenseCategory, CreditCard + 10 more (~17576 tok)
  - section `Expense` L45-55 (~83 tok)
  - section `Installment` L56-64 (~63 tok)
  - section `Income` L65-71 (~31 tok)
  - section `Note` L72-105 (~266 tok)
  - section `MonthlyData` L106-205 (~585 tok)
  - section `ExpenseStore` L206-286 (~1097 tok)
  - fn `generateRecurringGroupId` L287-477 (~1547 tok)
  - fn `getCurrentMonth` L478-517 (~494 tok)
  - fn `shouldUseSampleData` L518-1888 (~12993 tok)
- `formatters.ts` — Locale-aware formatting utilities (~748 tok)
  - fn `formatCurrency` L19-39 (~159 tok)
  - fn `formatShortCurrency` L40-72 (~221 tok)
  - fn `formatNumber` L73-88 (~134 tok)
  - fn `formatPercentage` L89-100 (~82 tok)
- `goal-utils.ts` — Exports GoalDisplayStatus, getConfirmedTotal, getPendingTotal, getProgressPercent + 2 more (~741 tok)
  - fn `getConfirmedTotal` L6-11 (~60 tok)
  - fn `getPendingTotal` L12-17 (~60 tok)
  - fn `getProgressPercent` L18-23 (~71 tok)
  - fn `getMonthlyNeeded` L24-38 (~157 tok)
  - fn `getGoalStatus` L39-69 (~338 tok)
- `lambda-client.ts` — Exports generateInviteCode, removeMember, createWorkspace, acceptInvite (~508 tok)
  - fn `generateInviteCode` L3-15 (~134 tok)
  - fn `removeMember` L16-24 (~95 tok)
  - fn `createWorkspace` L25-37 (~121 tok)
  - fn `acceptInvite` L38-54 (~142 tok)
- `locale-cookie.ts` — Server-side: Read locale from Next.js cookies() (~621 tok)
  - fn `getLocaleFromCookie` L12-19 (~67 tok)
  - fn `setLocaleCookie` L20-29 (~84 tok)
  - fn `getLocaleFromHeaders` L30-52 (~180 tok)
  - fn `getDefaultLocale` L53-59 (~38 tok)
  - fn `initializeLocaleFromStorage` L60-71 (~95 tok)
  - fn `isValidLocale` L72-78 (~61 tok)
- `migrations.ts` — Data Migration System for localStorage (~1923 tok)
  - fn `runMigrations` L161-194 (~282 tok)
  - fn `needsMigration` L195-207 (~99 tok)
  - fn `createBackup` L208-224 (~145 tok)
  - fn `cleanupOldBackups` L225-241 (~144 tok)
- `sync-store.ts` — Exports SyncStatus, SyncState, useSyncStore (~514 tok)
  - section `SyncState` L6-72 (~470 tok)
- `use-amplify-data.ts` — Get a typed Amplify Data client for CRUD operations (~228 tok)
- `utils.ts` — Exports cn (~48 tok)
- `validations.ts` — Expense form validation schema (~728 tok)
- `workspace-client.ts` — Singleton Amplify client (~4458 tok)
  - fn `getAmplifyClient` L8-152 (~924 tok)
  - fn `fetchAll` L153-173 (~161 tok)
  - fn `fetchWorkspaceData` L174-354 (~1337 tok)
  - fn `createCategory` L355-367 (~103 tok)
  - fn `updateCategory` L368-377 (~122 tok)
  - fn `deleteCategory` L378-383 (~64 tok)
  - fn `createCreditCard` L384-395 (~94 tok)
  - fn `updateCreditCard` L396-408 (~126 tok)
  - fn `deleteCreditCard` L409-414 (~65 tok)
  - fn `createMonthlyData` L415-424 (~103 tok)
  - fn `updateMonthlyData` L425-433 (~70 tok)
  - fn `createIncome` L434-444 (~98 tok)
  - fn `updateIncome` L445-452 (~86 tok)
  - fn `deleteIncome` L453-458 (~59 tok)
  - fn `createExpense` L459-473 (~136 tok)
  - fn `updateExpense` L474-483 (~124 tok)
  - fn `deleteExpense` L484-489 (~60 tok)
  - fn `createInstallment` L490-501 (~109 tok)
  - fn `deleteInstallment` L502-507 (~62 tok)
  - fn `createNote` L508-522 (~127 tok)
  - fn `updateNote` L523-534 (~163 tok)
  - fn `deleteNote` L535-540 (~58 tok)
  - fn `getWorkspaceLastActivity` L541-546 (~77 tok)
  - fn `touchWorkspaceActivity` L547-553 (~60 tok)
- `write-queue.ts` — Exports WriteModel, WriteOp, PendingWrite, enqueue + 4 more (~1440 tok)
  - fn `readQueue` L31-39 (~53 tok)
  - fn `saveQueue` L40-43 (~32 tok)
  - fn `enqueue` L44-54 (~70 tok)
  - fn `getPendingCount` L55-58 (~22 tok)
  - fn `processQueue` L59-83 (~206 tok)
  - fn `dispatch` L84-164 (~735 tok)
  - fn `startBackgroundProcessor` L165-179 (~100 tok)
  - fn `stopBackgroundProcessor` L180-186 (~46 tok)

## lib/adapters/

- `auth-adapter.ts` — Exports AuthAdapter (~61 tok)
- `config.ts` — Exports AdapterConfig, loadConfig (~347 tok)
- `context.tsx` — AdapterContext — uses useContext, useState, useEffect (~365 tok)
- `factory.ts` — Exports createAdapters (~225 tok)
- `registry.ts` — Exports setAdapters, getStorage, getCollaborativeStorage, getAuth (~296 tok)
- `storage-adapter.ts` — Exports StorageAdapter, CollaborativeStorageAdapter (~600 tok)
  - section `StorageAdapter` L17-54 (~450 tok)
  - section `CollaborativeStorageAdapter` L55-60 (~77 tok)
- `types.ts` — Exports WorkspaceData, Session, UserProfile, Workspace + 10 more (~952 tok)

## lib/adapters/amplify/

- `amplify-auth-adapter.ts` — Exports AmplifyAuthAdapter (~330 tok)
- `amplify-storage-adapter.ts` — Exports AmplifyStorageAdapter (~1395 tok)
  - class `AmplifyStorageAdapter` L21-155 (~1254 tok)

## lib/adapters/local/

- `local-storage-adapter.ts` — Exports LocalStorageAdapter (~1860 tok)
  - class `LocalStorageAdapter` L20-247 (~1745 tok)
- `no-auth-adapter.ts` — Exports NoAuthAdapter (~133 tok)

## lib/hooks/

- `use-workspace-sync.ts` — Exports useWorkspaceSync (~119 tok)

## messages/

- `en.json` (~6452 tok)
- `pt.json` (~6832 tok)

## playwright-report/

- `index.html` — Playwright Test Report (~146133 tok)

## styles/

- `globals.css` — Styles: 6 rules, 103 vars, 1 layers (~1244 tok)

## test-results/

- `.last-run.json` (~13 tok)
