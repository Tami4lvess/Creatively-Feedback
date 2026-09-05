# Conectar o formulário à Planilha Google

O site já está preparado para enviar as respostas. Esta configuração precisa ser feita uma única vez na conta Google que será proprietária da planilha.

## 1. Criar a planilha

1. Abra o Google Planilhas.
2. Crie uma planilha vazia.
3. Dê a ela um nome como `Feedback — Creatively`.

Não é necessário criar colunas. O código fará isso automaticamente no primeiro envio.

## 2. Adicionar o Apps Script

1. Dentro da planilha, abra **Extensões → Apps Script**.
2. Apague o código de exemplo.
3. Abra o arquivo `google-apps-script/Code.gs` deste pacote.
4. Copie todo o conteúdo e cole no editor do Apps Script.
5. Clique em **Salvar**.

## 3. Publicar o coletor

1. Clique em **Implantar → Nova implantação**.
2. Em “Selecionar tipo”, escolha **App da Web**.
3. Em “Executar como”, escolha **Eu**.
4. Em “Quem pode acessar”, escolha **Qualquer pessoa**.
5. Clique em **Implantar** e autorize o acesso à planilha.
6. Copie o endereço fornecido. Ele deve começar com `https://script.google.com/` e terminar em `/exec`.

## 4. Ligar o endereço ao site

Abra `dist/config.js` e troque:

```js
googleScriptUrl: ""
```

por:

```js
googleScriptUrl: "COLE_AQUI_O_ENDERECO_TERMINADO_EM_EXEC"
```

Salve e publique novamente o site.

## 5. Fazer o teste final

1. Abra o formulário publicado.
2. Envie uma resposta de teste.
3. Volte à planilha.
4. Confira a aba `Respostas`, criada automaticamente.

O formulário bloqueia o envio enquanto o endereço não estiver configurado, evitando que o visitante receba uma confirmação falsa.

## Privacidade

O formulário solicita nome, e-mail, cidade e estado. Restrinja o acesso à planilha aos responsáveis pelo projeto, não publique as respostas individuais e exclua dados que não precisem mais ser mantidos.
