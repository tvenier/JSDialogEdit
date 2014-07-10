Versão 3.0 Concluida disponivel para Download, ou acesse o demo online.

Utilizando uma interface do tipo "arrastar/soltar" é possível a criação de Caixas de Diálogos simples como "Aceitar/Rejeitar" bem como com recursos avançados como consultar Banco de Dados para popular elementos em tempo de execução.

Após a conclusão da janela, basta o desenvolvedor copiar o código gerado e incluir na página onde deseja exibir a janela. O código vai sendo gerado automaticamente a medida que a janela vai sendo desenhada e exibido em uma janela na parte inferior da tela. Também é possivel carregar diretamente do arquivo salvo no servidor.

O editor permite o desenho da janela utilizando componentes como Caixa Texto, Botão, Caixa de Seleção, Campo Data, Campo Oculto, entre outros, como também a possibilidade de inserir códigos JavaScript em seus eventos e assim ate mesmo alterar o comportamento da Caixa de Dialogo.

Um componente de Conexao permite a janela acessar dados externos para popular os outros elementos da janela como se faria em uma IDE de outras linguagens ampliando de forma significativa as possibilidades de uso do editor.

Na página onde o código é inserido, o envio dos dados informados pelo usuário da Caixa de Dialogo é feito através de uma requisição AJAX evitando assim a necessidade de recarregar a tela, porem cria-se a necessidade de uma "função de retorno" para capturar a resposta da URL, no próprio editor pode ser feito isso através do evento "After Submit" do objeto Janela.

Um detalhe importante é que devido a forma como foi criado, é necessário incluir outros arquivos JavaScript e CSS de suporte para a execução na página.

Alguns recursos da versão 3:
   * Permite editar varias janelas ao mesmo tempo
   * É possível conectar à uma fonte de dados tanto em XML como em JSON;
   * Alem de salvar e abrir arquivos em servidores web (na pasta de exemplos há arquivos que demonstram esses recursos) também é possivel utilizar o recurso de LocalStorage do próprio navegador;
   * Novos componentes como Imagem, TreeView, Painel e Caixa de Grupo;
   * Nova implementação do código que permite criar novos componentes para o JSDEV3 com poucas linhas de código;
   * Utilizando CSS nos Componentes permitindo personalização do layout somente alterando o arquivo de CSS, na pasta CSS há um arquivo de exemplo que altera a interface do editor; 

