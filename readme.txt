Vers�o 3.0 Concluida disponivel para Download, ou acesse o demo online.

Utilizando uma interface do tipo "arrastar/soltar" � poss�vel a cria��o de Caixas de Di�logos simples como "Aceitar/Rejeitar" bem como com recursos avan�ados como consultar Banco de Dados para popular elementos em tempo de execu��o.

Ap�s a conclus�o da janela, basta o desenvolvedor copiar o c�digo gerado e incluir na p�gina onde deseja exibir a janela. O c�digo vai sendo gerado automaticamente a medida que a janela vai sendo desenhada e exibido em uma janela na parte inferior da tela. Tamb�m � possivel carregar diretamente do arquivo salvo no servidor.

O editor permite o desenho da janela utilizando componentes como Caixa Texto, Bot�o, Caixa de Sele��o, Campo Data, Campo Oculto, entre outros, como tamb�m a possibilidade de inserir c�digos JavaScript em seus eventos e assim ate mesmo alterar o comportamento da Caixa de Dialogo.

Um componente de Conexao permite a janela acessar dados externos para popular os outros elementos da janela como se faria em uma IDE de outras linguagens ampliando de forma significativa as possibilidades de uso do editor.

Na p�gina onde o c�digo � inserido, o envio dos dados informados pelo usu�rio da Caixa de Dialogo � feito atrav�s de uma requisi��o AJAX evitando assim a necessidade de recarregar a tela, porem cria-se a necessidade de uma "fun��o de retorno" para capturar a resposta da URL, no pr�prio editor pode ser feito isso atrav�s do evento "After Submit" do objeto Janela.

Um detalhe importante � que devido a forma como foi criado, � necess�rio incluir outros arquivos JavaScript e CSS de suporte para a execu��o na p�gina.

Alguns recursos da vers�o 3:
   * Permite editar varias janelas ao mesmo tempo
   * � poss�vel conectar � uma fonte de dados tanto em XML como em JSON;
   * Alem de salvar e abrir arquivos em servidores web (na pasta de exemplos h� arquivos que demonstram esses recursos) tamb�m � possivel utilizar o recurso de LocalStorage do pr�prio navegador;
   * Novos componentes como Imagem, TreeView, Painel e Caixa de Grupo;
   * Nova implementa��o do c�digo que permite criar novos componentes para o JSDEV3 com poucas linhas de c�digo;
   * Utilizando CSS nos Componentes permitindo personaliza��o do layout somente alterando o arquivo de CSS, na pasta CSS h� um arquivo de exemplo que altera a interface do editor; 

