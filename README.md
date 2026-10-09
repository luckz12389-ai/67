# HelloBin: tutorial para celular (Android)

## Limitação importante (leia primeiro)
O painel da Vercel **não tem upload de pastas/arquivos**. Ele só publica a partir de um repositório Git (GitHub, GitLab ou Bitbucket), de um template ou pelo CLI (terminal). Não existe caminho oficial só com upload, e eu não vou fingir que existe.

O caminho mais simples **sem Git, sem terminal e sem computador** é usar o GitHub pelo navegador do celular só como "depósito" de arquivos (você não escreve comandos). Para evitar subir 41 arquivos um por um, você envia **1 arquivo ZIP** e **1 arquivo de automação** que o descompacta.

## Parte A: GitHub pelo navegador (5 minutos)
1. Abra o Chrome, vá em github.com, crie uma conta e entre.
2. Toque em **+** > **New repository**. Nome: `hellobin`. Deixe **Private** se preferir. Marque **Add a README file**. Toque em **Create repository**.
3. No repositório: **Add file** > **Create new file**. No campo do nome digite exatamente `.github/workflows/unzip.yml` (as barras criam as pastas). Cole o conteúdo do arquivo `unzip.yml` que acompanha este projeto. Toque em **Commit changes** > **Commit changes**.
4. **Add file** > **Upload files**. Escolha o arquivo `hellobin.zip` (ele precisa ficar na raiz do repositório). Toque em **Commit changes**.
5. Abra a aba **Actions** > **Descompactar projeto** > **Run workflow** > **Run workflow**. Se aparecer o botão verde "I understand my workflows, go ahead and enable them", toque nele primeiro.
6. Espere ficar verde (cerca de 20 segundos). Volte para **Code**: as pastas `app`, `components`, `lib`, `supabase` etc. devem estar lá e o zip some.

## Parte B: Supabase (banco e login)
1. Abra supabase.com, entre com sua conta e toque em **New project**. Escolha nome, senha do banco (guarde) e região. Aguarde ~2 minutos.
2. Menu **SQL Editor** > **New query**. Abra `supabase/schema.sql` no GitHub (toque em **Raw** e copie tudo), cole e toque em **Run**. Deve aparecer "Success".
3. **Project Settings** > **API**. Copie: **Project URL** e a chave **anon / publishable**. Nunca use a `service_role`.
4. (Mais tarde, depois do passo C.5) **Authentication** > **URL Configuration**: em **Site URL** coloque o endereço do seu site na Vercel; em **Redirect URLs** adicione `https://SEU-SITE.vercel.app/**`.
5. Opcional para testar mais rápido: **Authentication** > **Sign In / Providers** > **Email** e desligue **Confirm email**. Se deixar ligado, cada conta nova precisa clicar no link do e-mail (abra no mesmo navegador).

## Parte C: Vercel
1. Abra vercel.com, toque em **Continue with GitHub** e autorize.
2. **Add New...** > **Project** > ao lado de `hellobin` toque em **Import**.
3. Framework: **Next.js** (detectado sozinho). Abra **Environment Variables** e adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = chave anon
   - (opcional) `NEXT_PUBLIC_SITE_URL` = seu domínio próprio, se tiver
4. Toque em **Deploy** e espere terminar.
5. Copie o endereço (`https://algo.vercel.app`) e volte ao passo B.4.
6. Se o site pedir login da Vercel ao abrir, vá em **Settings** > **Deployment Protection** e desative a proteção para Production.

## Parte D: Testes
1. Abra o site, toque em **Entrar** > **Criar conta**.
2. **Nova publicação**: título "Teste", cole um texto, deixe o nome do link como `hello`, toque em **Publicar**.
3. Abra `/raw/hello`: deve mostrar só o texto puro.
4. Toque em **Editar**, troque o nome do link para `Hello1` (a prévia do endereço muda e o site avisa se estiver livre) e salve.
5. Abra `/p/Hello1` (página) e `/raw/Hello1` (texto puro). `/raw/hello` deixa de funcionar.
6. Teste privada: edite e desmarque **Pública**. Abra o link RAW em uma aba anônima: deve dar 404.

## Parte E: Google
1. Abra search.google.com/search-console e toque em **Adicionar propriedade** > **Prefixo do URL**, com `https://SEU-SITE.vercel.app`.
2. Verificação: escolha **Tag HTML**, copie só o valor de `content` (a parte depois de `content="`). Na Vercel, em **Settings** > **Environment Variables**, crie `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` com esse valor, vá em **Deployments** > menu do último deploy > **Redeploy**. Depois toque em **Verificar** no Google.
3. **Sitemaps** > digite `sitemap.xml` > **Enviar**.
4. **Inspeção de URL**: cole `https://SEU-SITE.vercel.app/` > **Solicitar indexação**. Repita para uma publicação pública.
5. A indexação leva de dias a semanas e o Google decide se indexa; não há garantia. Só publicações **públicas** e **marcadas para aparecer na busca** entram no sitemap. Páginas privadas, de edição, login, painel e RAW não são indexadas.

## Domínio próprio no futuro
Adicione o domínio em Vercel > Settings > Domains, defina `NEXT_PUBLIC_SITE_URL=https://seudominio.com`, faça redeploy e atualize o Site URL no Supabase. Sitemap, canonical e Open Graph passam a usar o domínio novo.

## O que o projeto faz e o que não faz
- Faz: login real (Supabase), publicações no banco, slug personalizado com unicidade sem diferenciar maiúsculas/minúsculas, checagem de disponibilidade, RAW em texto puro, público/privado por regras de banco (RLS), busca, tags, views, expiração, limite de 200.000 caracteres, limite de 5 publicações por minuto por usuário, sitemap dinâmico, robots, Open Graph e canonical.
- O editor é um campo de texto monospace; o destaque de sintaxe e a numeração de linhas aparecem na página de visualização, não durante a digitação.
- Trocar o slug invalida o link antigo (não há redirecionamento).
- Links "Hello1" e "hello1" são o mesmo endereço (unicidade sem diferenciar caixa); o site guarda e exibe a grafia que você escolheu.
- O conteúdo nunca é executado nem inserido como HTML sem escape.
