# Google Calendar Sync

Este projeto tem como objetivo sincronizar eventos entre dois calendários do Google. Isso pode ser especialmente útil se você tiver um calendário principal que deseja espelhar em um calendário secundário.

O projeto é configurado para ser executado a cada 20 minutos utilizando o GitHub Actions. Além disso, ele é empacotado em um contêiner Docker para uma maior portabilidade e fácil configuração.

## Pré-requisitos

Para configurar o Google Calendar Sync, você precisará:

1. Dois calendários do Google que deseja sincronizar.
2. Conta no GitHub para a configuração do GitHub Actions.
3. Conta no Docker Hub para armazenar a imagem Docker.
4. Node.js (versão 14 ou superior) e Docker instalados localmente para testar e executar o projeto.

## Configuração de Contas do Google

Para permitir que o script acesse seus calendários do Google, você precisa configurar contas de serviço do Google para os calendários de origem e de destino. Siga estes passos para cada calendário:

1. Acesse a [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto para este serviço.
3. Vá para **APIs & Services > Library**.
4. Ative a **Google Calendar API** para o projeto.
5. Vá para **APIs & Services > Credentials**.
6. Clique em **Create Credentials** e selecione **Service account**.
7. Preencha os detalhes necessários e clique em **Create**.
8. No passo **Grant this service account access to project**, não é necessário selecionar qualquer função, clique em **Continue**.
9. Clique em **Done**.
10. Na lista de contas de serviço, clique na conta de serviço que você acabou de criar.
11. Na seção **Keys**, clique em **Add Key** e selecione **JSON**.
12. Isso baixará um arquivo JSON contendo as credenciais da conta de serviço. Mantenha este arquivo seguro e não o compartilhe ou o envie a um repositório público.

Em cada calendário do Google que você deseja sincronizar, você precisará dar permissão para a respectiva conta de serviço:

1. No Google Calendar, vá para as configurações do calendário que você deseja sincronizar.
2. Na seção **Share with specific people**, clique em **Add people**.
3. Adicione o email da conta de serviço e defina as permissões como **Make changes to events**.
4. Clique em **Send**.

## Configuração do Projeto

Clone o repositório do projeto localmente e instale as dependências necessárias:

```bash
git clone https://github.com/mentordosnerds/google-calendar-sync.git
cd google-calendar-sync
npm install
```

Crie um arquivo `.env` baseado no arquivo `.env.example` e preencha as variáveis de ambiente apropriadas. Você precisará dos IDs dos calendários e das credenciais das contas de serviço do Google obtidas anteriormente.

```bash
cp .env.example .env
```

## Configuração do GitHub Actions

Para configurar o GitHub Actions, você precisará adicionar as variáveis de ambiente como secrets no seu repositório GitHub:

1. No GitHub, vá para o repositório do projeto.
2. Vá para **Settings > Secrets**.
3. Clique em **New repository secret** e adicione cada uma das variáveis de ambiente no arquivo `.env` como um secret separado.

Você também precisará adicionar suas credenciais Docker Hub como secrets para que o GitHub Actions possa enviar a imagem Docker para o Docker Hub. Adicione `DOCKER_HUB_USERNAME` e `DOCKER_HUB_PASSWORD` como secrets.

Finalmente, atualize o arquivo de configuração do GitHub Actions [.github/workflows/main.yml](.github/workflows/main.yml) com o nome do seu repositório Docker Hub.

Com isso, o projeto está pronto para ser executado. O GitHub Actions irá construir e enviar a imagem Docker para o Docker Hub sempre que um push for feito na branch main ou quando uma tag for criada. Além disso, ele irá executar o script a cada 20 minutos para sincronizar os calendários.

## Executando o Projeto Localmente

Para testar o projeto localmente, você pode executar:

```bash
node index.js
```

ou, para executar o projeto em um contêiner Docker, você pode construir a imagem Docker e executar o contêiner:

```bash
docker build -t google-calendar-sync .
docker run --env-file .env google-calendar-sync
```

Certifique-se de que o arquivo .env contém as variáveis de ambiente corretas antes de executar o contêiner.
