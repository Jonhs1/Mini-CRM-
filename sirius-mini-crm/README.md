# Mini-CRM Inteligente com IA
### Desafio Técnico

Uma aplicação web para gerenciamento de contatos comerciais, classificação inteligente de oportunidades e sugestão de respostas personalizadas, integrando JavaScript, n8n e Google Gemini.

---

## Visão geral

O **Mini-CRM Inteligente** foi desenvolvido para facilitar a organização e a triagem de contatos comerciais

A aplicação permite cadastrar interessados, acompanhar o andamento dos atendimentos e utilizar inteligência artificial para interpretar mensagens, identificar oportunidades e sugerir respostas adequadas a cada contexto.

O objetivo é tornar o processo de triagem mais organizado, consistente e eficiente, mantendo a equipe responsável pela decisão final sobre o atendimento.

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| Cadastro de contatos | Registro de nome, WhatsApp e mensagem recebida. |
| Gerenciamento de contatos | Visualização e exclusão de registros. |
| Controle de atendimento | Atualização do status do contato. |
| Persistência local | Armazenamento dos dados no navegador por meio do `localStorage`. |
| Análise com IA | Envio da mensagem para análise automatizada. |
| Classificação comercial | Identificação da categoria e do nível de prioridade. |
| Resposta sugerida | Geração de uma resposta personalizada em português. |
| Automação | Comunicação entre o CRM e o workflow do n8n por webhook. |

## Tecnologias utilizadas

**Frontend**
- HTML5 — estrutura da aplicação.
- CSS3 — apresentação e estilização da interface.
- JavaScript — lógica, eventos e integração com o webhook.
- localStorage — persistência dos contatos no navegador.

**Automação e inteligência artificial**
- n8n — orquestração do fluxo de processamento.
- Google Gemini — interpretação das mensagens e geração de sugestões.
- Webhook HTTP — comunicação entre o CRM e o workflow.

## Fluxo de funcionamento

1. O usuário cadastra um contato no CRM.
2. Os dados do contato são armazenados no navegador.
3. Ao solicitar uma análise, o CRM envia nome, WhatsApp e mensagem ao webhook do n8n.
4. O Google Gemini interpreta a mensagem e retorna uma classificação comercial e uma resposta sugerida.
5. O nó Code valida e organiza os campos retornados pela IA.
6. O nó Respond to Webhook devolve o resultado ao CRM.
7. A interface apresenta a análise ao usuário.

**Fluxo técnico:**

`CRM → Webhook → Google Gemini → Code → Respond to Webhook → CRM`

## Regras de classificação

### Categorias comerciais

- **Abertura de empresa:** contatos interessados em constituir uma empresa no Paraguai.
- **Consultoria:** contatos que buscam orientação ou esclarecimentos especializados.
- **Produtos digitais:** interessados em materiais educativos ou conteúdos digitais.
- **Outros serviços:** mensagens que não se enquadram nas categorias anteriores.

### Níveis de prioridade

- **Alta:** intenção comercial concreta, com interesse em avançar para a contratação.
- **Média:** interesse real, mas que ainda depende de informações ou esclarecimentos.
- **Baixa:** contato exploratório ou interessado em aprender antes de contratar.

A classificação é automatizada e pode exigir revisão humana, especialmente em mensagens ambíguas.

## Como executar localmente

### Pré-requisitos

- Visual Studio Code ou outro editor de código.
- Navegador atualizado.
- Extensão Live Server para executar a interface localmente.
- Workflow configurado e publicado no n8n para utilizar a análise com IA.

### Passo a passo

1. Abra a pasta do projeto no Visual Studio Code.
2. Confirme a presença dos arquivos `index.html`, `style.css` e `script.js`.
3. Abra o `index.html` com a opção **Open with Live Server**.
4. Acesse a página aberta no navegador.
5. Cadastre um contato fictício.
6. Utilize a opção **Analisar com IA** para testar a integração.

O CRM pode ser aberto para consultar as funcionalidades locais sem uma análise de IA, mas a classificação automatizada depende da disponibilidade e da configuração correta do webhook.

## Configuração do n8n e do Gemini

Para habilitar a análise inteligente:

1. Configure a credencial do Google Gemini no n8n.
2. Confira as configurações do nó Webhook e o método HTTP `POST`.
3. Verifique a sequência dos nós e as configurações da resposta JSON.
4. Publique ou ative o workflow.
5. Configure a URL de produção correspondente no `script.js`.
6. Confira as permissões de CORS para a origem utilizada pelo CRM, quando aplicável.
7. Realize um teste de ponta a ponta.

**Segurança:** mantenha as chaves de API e os tokens em credenciais apropriadas. Não os inclua no README, em capturas de tela ou em arquivos disponibilizados publicamente.

## Persistência e limitações

Os contatos são armazenados no `localStorage` do navegador. Isso significa que os registros ficam vinculados ao navegador e à origem utilizados para abrir a aplicação.

O projeto não deve ser considerado um sistema de armazenamento centralizado: os dados não são automaticamente compartilhados entre dispositivos ou usuários.

A análise por IA depende da disponibilidade do n8n e do serviço do Google Gemini. As respostas são sugestões de atendimento e devem ser revisadas antes de serem enviadas a clientes. Orientações jurídicas, tributárias ou migratórias não devem ser apresentadas como conclusões definitivas geradas automaticamente.

## Cenários de teste

O projeto contempla três cenários de validação comercial:

1. **Abertura de empresa sem cédula paraguaia:** avaliar o interesse e sugerir o encaminhamento adequado à equipe.
2. **Interesse em contratar a abertura de uma EAS:** identificar a intenção comercial e sugerir o próximo passo.
3. **Interesse educacional:** identificar contatos que desejam aprender sobre negócios no Paraguai antes de contratar.

Os resultados devem ser conferidos com as regras de classificação e documentados por meio de capturas de tela.

## Estrutura do projeto

```text
Mini-CRM/
├── index.html
├── style.css
├── script.js
└── README.md
```

Esta estrutura representa os quatro arquivos principais identificados no projeto. Outros arquivos podem existir conforme a configuração local.

## Autor

**João Victor Miranda Oliveira**

Projeto desenvolvido como parte do desafio técnico.