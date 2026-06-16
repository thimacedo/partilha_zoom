# Guia de Publicação: SPH Timer no Zoom App Marketplace

Como a publicação de aplicativos exige login seguro, autenticação em duas etapas (2FA) e gerenciamento de credenciais na sua conta de desenvolvedor, este processo deve ser feito manualmente no portal da Zoom.

Abaixo está o guia passo a passo com todas as configurações exatas para registrar e publicar o **SPH Timer** no **Zoom App Marketplace**.

---

## 📋 Pré-requisitos
1. Uma conta de desenvolvedor Zoom ativa (acesse [Zoom Marketplace](https://marketplace.zoom.us/) e faça login).
2. O SPH Timer rodando sob um túnel HTTPS seguro (obrigatório para o Zoom client). Para testes locais, você pode usar um serviço como **ngrok** (ex: `https://xxxxx.ngrok-free.app`) direcionado para a porta do Caddy (`:81`) ou Next.js (`:3000`).

---

## 🛠️ Passo a Passo no Zoom Marketplace

### 1. Criar o Aplicativo
1. No cabeçalho do portal, vá em **Develop** ➔ **Build App**.
2. No card **Zoom App**, clique em **Create**.
3. Defina o nome do aplicativo como `SPH Timer`.
4. Escolha se deseja que o aplicativo seja publicado publicamente no Marketplace (Admin-managed) ou apenas para uso interno (User-managed) e clique em **Create**.

---

### 2. Preencher Informações Básicas (Information)
Preencha os campos obrigatórios na aba **App Information**:
* **App Name:** `SPH Timer`
* **Short Description:** `Cronômetro de duas fases com fila de oradores para reuniões.`
* **Long Description:** `SPH Timer é uma ferramenta premium de cronometragem de duas fases projetada para reuniões online. Possui presets configuráveis, progresso circular visual, fila interativa de falantes (oradores) com reordenação por arrasto (drag-and-drop), histórico de sessões e um widget flutuante compacto (Modo SPH) para exibição discreta durante chamadas.`
* **Developer Name:** Seu Nome / Empresa
* **Developer Email:** Seu Email de contato

---

### 3. Configurar Recursos (Feature)
Na aba **Feature**, ative a opção **Zoom App** e configure os seguintes parâmetros:

#### A. Running Context (Contexto de Execução)
* Ative a opção **In-Meeting App** (para que o cronômetro possa ser aberto na barra lateral durante as reuniões).

#### B. URLs do Aplicativo
Configure as URLs utilizando o seu domínio público (ex: do ngrok para testes ou seu domínio de produção):
* **Home URL:** `https://<seu-dominio-ou-ngrok>` (ex: `https://sph-timer.seudominio.com`)
* **Redirect URL for OAuth:** `https://<seu-dominio-ou-ngrok>/api/auth/callback/zoom`

#### C. Domain Allow List (Lista de Domínios Permitidos)
O Zoom bloqueia o carregamento de qualquer domínio não listado. Adicione os seguintes domínios:
1. `appssdk.zoom.us` *(Obrigatório para carregar as APIs do SDK do Zoom)*
2. `<seu-dominio-ou-ngrok>` (ex: `sph-timer.seudominio.com` ou `xxxxx.ngrok-free.app`)
3. `z-cdn.chatglm.cn` *(Usado para renderizar o logo/ícone padrão)*

---

### 4. Definir Permissões (Scopes)
Na aba **Scopes**, clique em **Add Scopes** para conceder permissões ao app:
* **Categoria:** Zoom App
* **Escopo necessário:** `zoomapp:inmeeting` (permite que o app obtenha dados da reunião ativa e abra na barra lateral).

> [!IMPORTANT]
> Sem o escopo `zoomapp:inmeeting` habilitado, a inicialização do SDK do Zoom (`zoomSdk.config`) falhará silenciosamente no cliente.

---

### 5. Configurar as Credenciais no Código (`.env`)
Após criar o app, o Zoom fornecerá um **Client ID** e um **Client Secret** na aba **App Credentials**. 
Crie ou configure o arquivo `.env` na raiz do seu projeto `PARTILHAS_ZOOM` com essas informações:

```env
ZOOM_APP_CLIENT_ID=Copie_o_Client_ID_do_Portal
ZOOM_APP_CLIENT_SECRET=Copie_o_Client_Secret_do_Portal
ZOOM_APP_REDIRECT_URI=https://<seu-dominio-ou-ngrok>/api/auth/callback/zoom
```

---

## 🧪 Como Testar no Cliente Zoom
1. Na aba **Submit** ou **Local Test** do portal de desenvolvedores, clique em **Add App** ou **Install**.
2. Isso abrirá o cliente Zoom e solicitará autorização para instalar o `SPH Timer`.
3. Abra uma reunião no Zoom, clique no botão **Apps** no menu inferior do Zoom e selecione **SPH Timer**.
4. O cronômetro abrirá na barra lateral direita, pronto para ser usado e compartilhado com os participantes da chamada!
