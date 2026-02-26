'use client'

import { TempestLogo, TempestIconMark } from './tempest-logo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const brandColors = [
  {
    name: 'Azul Tempest',
    hex: '#1A8FE3',
    role: 'Primary',
    description: 'Confianca e clareza',
    className: 'bg-primary',
  },
  {
    name: 'Verde Teal',
    hex: '#22C997',
    role: 'Accent',
    description: 'Crescimento e sucesso',
    className: 'bg-accent',
  },
  {
    name: 'Coral Quente',
    hex: '#FF7849',
    role: 'Warm',
    description: 'Energia e simpatia',
    className: 'bg-tempest-coral',
  },
  {
    name: 'Slate Escuro',
    hex: '#1E293B',
    role: 'Foreground',
    description: 'Texto e contraste',
    className: 'bg-foreground',
  },
  {
    name: 'Off-White',
    hex: '#F8FAFC',
    role: 'Background',
    description: 'Base e respiro',
    className: 'bg-background border border-border',
  },
]

export function BrandShowcase() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="bg-primary absolute inset-0 opacity-[0.03]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-20">
          <Badge variant="secondary" className="text-sm font-medium">
            Identidade Visual
          </Badge>
          <div className="flex flex-col items-center gap-6 text-center">
            <TempestLogo variant="icon" size="xl" animated />
            <div>
              <h1
                className="text-foreground text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Tempest
              </h1>
              <p className="text-muted-foreground mt-3 text-lg leading-relaxed md:text-xl">
                Controle financeiro familiar. Simples, colorido e acolhedor.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pb-20">
        {/* Logo Variations */}
        <section className="mt-16">
          <SectionTitle
            title="Logo"
            subtitle="Variacoes do logotipo para diferentes contextos e plataformas"
          />

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Full Logo - Light Background */}
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Logo Completo - Fundo Claro
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-background flex items-center justify-center rounded-lg p-10">
                <TempestLogo variant="full" size="lg" animated />
              </CardContent>
            </Card>

            {/* Full Logo - Dark Background */}
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Logo Completo - Fundo Escuro
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-foreground flex items-center justify-center rounded-lg p-10">
                <TempestLogo variant="full" size="lg" colorScheme="mono-light" />
              </CardContent>
            </Card>

            {/* Wordmark */}
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Wordmark
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-background flex items-center justify-center rounded-lg p-10">
                <TempestLogo variant="wordmark" size="lg" />
              </CardContent>
            </Card>

            {/* Icon Sizes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Icone - Tamanhos
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-background flex items-center justify-center gap-6 rounded-lg p-10">
                <TempestLogo variant="icon" size="xl" animated />
                <TempestLogo variant="icon" size="lg" />
                <TempestLogo variant="icon" size="md" />
                <TempestLogo variant="icon" size="sm" />
                <TempestLogo variant="icon" size="xs" />
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-16" />

        {/* Color Palette */}
        <section>
          <SectionTitle
            title="Paleta de Cores"
            subtitle="Cinco cores cuidadosamente escolhidas para transmitir confianca, crescimento e acolhimento"
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {brandColors.map((color) => (
              <Card key={color.hex} className="overflow-hidden">
                <div className={`${color.className} h-24`} />
                <CardContent className="p-4">
                  <p className="text-foreground text-sm font-semibold">{color.name}</p>
                  <p className="text-muted-foreground mt-0.5 font-mono text-xs">{color.hex}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {color.role}
                  </Badge>
                  <p className="text-muted-foreground mt-2 text-xs">{color.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-16" />

        {/* Typography */}
        <section>
          <SectionTitle
            title="Tipografia"
            subtitle="Duas familias tipograficas complementares para hierarquia e legibilidade"
          />

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Titulos - Nunito
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p
                    className="text-foreground text-4xl font-extrabold"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Aa Bb Cc 123
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Nunito - Arredondada, amigavel e moderna
                  </p>
                </div>
                <div className="space-y-2">
                  <p
                    className="text-foreground text-3xl font-extrabold"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Titulo Principal
                  </p>
                  <p
                    className="text-foreground text-2xl font-bold"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Subtitulo da Secao
                  </p>
                  <p
                    className="text-foreground text-xl font-semibold"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Titulo do Card
                  </p>
                  <p
                    className="text-foreground text-lg font-semibold"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Subtitulo Menor
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Corpo - Inter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-foreground font-sans text-4xl font-bold">Aa Bb Cc 123</p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Inter - Limpa, legivel e versátil
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-foreground font-sans text-base leading-relaxed">
                    O Tempest e o seu parceiro para organizar as financas da familia. Com uma
                    interface simples e colorida, voce acompanha receitas, despesas e investimentos
                    sem complicacao.
                  </p>
                  <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                    Texto secundario com menor destaque, ideal para descricoes, notas e informacoes
                    complementares que acompanham o conteudo principal.
                  </p>
                  <p className="text-muted-foreground font-sans text-xs">
                    Texto pequeno - legendas e labels
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-16" />

        {/* Icon Usage */}
        <section>
          <SectionTitle
            title="Uso do Icone"
            subtitle="Exemplos de aplicacao do icone em diferentes cenarios e plataformas"
          />

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* App Icon */}
            <Card className="text-center">
              <CardContent className="flex flex-col items-center gap-3 p-6">
                <div className="tempest-float">
                  <TempestIconMark size={64} animated />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">Icone do App</p>
                  <p className="text-muted-foreground text-xs">64x64px</p>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <Card className="text-center">
              <CardContent className="flex flex-col items-center gap-3 p-6">
                <div className="bg-foreground flex items-center gap-2 rounded-lg px-4 py-2.5">
                  <TempestIconMark size={28} />
                  <span
                    className="text-lg font-bold"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: 'white',
                    }}
                  >
                    Tempest
                  </span>
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">Sidebar Header</p>
                  <p className="text-muted-foreground text-xs">Navegacao lateral</p>
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail */}
            <Card className="text-center">
              <CardContent className="flex flex-col items-center gap-3 p-6">
                <div className="tempest-float-delay">
                  <TempestLogo variant="icon" size="md" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">Thumbnail</p>
                  <p className="text-muted-foreground text-xs">48x48px</p>
                </div>
              </CardContent>
            </Card>

            {/* Favicon */}
            <Card className="text-center">
              <CardContent className="flex flex-col items-center gap-3 p-6">
                <div className="tempest-float-delay-2">
                  <TempestLogo variant="icon" size="sm" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold">Favicon</p>
                  <p className="text-muted-foreground text-xs">32x32px</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-16" />

        {/* Brand Values */}
        <section>
          <SectionTitle
            title="Personalidade da Marca"
            subtitle="Os pilares que guiam toda a comunicacao visual do Tempest"
          />

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <BrandValueCard
              title="Acolhedor"
              description="Formas arredondadas, cores quentes e linguagem amigavel criam um ambiente onde a familia se sente confortavel."
              color="bg-tempest-coral"
            />
            <BrandValueCard
              title="Dinamico"
              description="Elementos de movimento e animacoes sutis refletem o fluxo financeiro e a energia de organizar a vida."
              color="bg-primary"
            />
            <BrandValueCard
              title="Confiavel"
              description="Cores consistentes, tipografia clara e espacamento generoso transmitem seguranca e profissionalismo acessivel."
              color="bg-accent"
            />
          </div>
        </section>

        <Separator className="my-16" />

        {/* Animated Logo Demo */}
        <section>
          <SectionTitle
            title="Logo Animado"
            subtitle="Versao animada do logo para uso em telas de carregamento, splash screens e interacoes"
          />

          <div className="mt-8 flex flex-col items-center gap-8">
            <Card className="w-full max-w-lg">
              <CardContent className="flex flex-col items-center gap-6 p-12">
                <TempestLogo variant="icon" size="xl" animated />
                <div className="text-center">
                  <p
                    className="text-foreground text-2xl font-bold"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Tempest
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">Controle financeiro familiar</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2
        className="text-foreground text-2xl font-bold md:text-3xl"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h2>
      <p className="text-muted-foreground mt-2 leading-relaxed">{subtitle}</p>
    </div>
  )
}

function BrandValueCard({
  title,
  description,
  color,
}: {
  title: string
  description: string
  color: string
}) {
  return (
    <Card className="overflow-hidden">
      <div className={`${color} h-2`} />
      <CardContent className="p-6">
        <h3
          className="text-foreground text-lg font-bold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h3>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}
