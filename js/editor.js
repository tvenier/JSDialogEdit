"use strict";

/*
    Autor: Teo Venier - http://code.google.com/p/jsdialogedit/
    Copyright (C) 2011-2014  Teo Venier
    
    This file is part of JSDialogEdit.

    JSDialogEdit is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSDialogEdit is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with JSDialogEdit.  If not, see <http://www.gnu.org/licenses/>.
*/

var ___JSDEIDIOMA = {};

/**
 * @class {static final} JSDialogEdit.Editor
 * Pacote para as classes utilizadas no editor
 */
JSDialogEdit.Editor = { };

/**
 * @class JSDialogEdit.Editor.Documento
 * Classe representando os documentos do editor
 * @constructor JSDialogEdit.Editor.Documento Cria um novo Documento para o editor
 * @param {Object} estrutura Objeto contendo as propriedades a serem atribuidas ao JSDialogEdit.Editor.Documento
 * As seguintes propriedades sao validas, sendo somente o primeiro obrigatorio:
 * nome    : propriedade obrigatoria que se refere ao nome do documento, tambem se refere ao nome do arquivo aberto
 * prop    : Objeto com pares Propriedade:Valor a serem atribuidos ao documento, por enquanto uma JSDialogEdit.Janela
 * classe  : classe que sera criada para representar o documento, por enquanto uma JSDialogEdit.Janela
 * formato : utilizado quando se abre um documento ja salvo para indicar o formato (XML, JSON) original
 * storage : utilizado quando se abre um documento ja salvo para indicar de qual local (LOCAL, REDE) o documento foi carregado
 */
JSDialogEdit.Editor.Documento = function (estrutura) {
    if(!estrutura.nome) throw "JSDialogEdit.Editor.Documento: DocumentoInvalidoException";
    var self = this;
    
    this.CLASSE = 'JSDialogEdit.Editor.Documento';
    this.nome = estrutura.nome;
    this.conteudo = estrutura.classe ? (
            estrutura.prop ?
                new estrutura.classe(estrutura.prop) :
                new estrutura.classe({
                    ID : estrutura.nome.replace(/\W/g, '')
                })
    ) : null;
    this.alterado = false;
    this.formato = estrutura.formato || null;
    this.storage = estrutura.storage || null;
    this.storageURL = estrutura.storageURL || null;
    this.propriedades = estrutura.propriedades || {};
    this.versaoAtualizada = false;
    this.desfazer = [];
    this.refazer = [];
    this.arvore = new JSDialogEdit.TreeView({
        "ID" : "Documento_" + (new Date).getTime(),
        "Estilos" : {
            'width':'100%',
            'height':'254px',
            'overflowX':'hidden',
            'overflowY':'auto',
            'border':'1px solid #E6E6E6'
        }
    });

    this.toString = function ___jsde_editor_documento_outer_tostring() {
        return this.CLASSE+'['+self.nome+']';
    };
    this.toObject = function ___jsde_editor_documento_outer_toobject() {
        var obj = this.conteudo.toObject();
        obj.propriedades = this.propriedades;
        return obj;
    }
    this.toXml = function ___jsde_editor_documento_outer_toxml() {
        var xml = this.conteudo.toXml();
        var propriedades = document.createElementNS("http://code.google.com/p/jsdialogedit/", "Propriedades");
        
        for (var item in this.propriedades) {
            var no = document.createElementNS("http://code.google.com/p/jsdialogedit/", "Propriedade");
            no.setAttribute("nome", item);
            no.textContent = this.propriedades[item];
            propriedades.appendChild(no);
        }
        
        return xml;
    }
    
    if(this.conteudo) {
        this.conteudo.setVisivel(true);
        this.conteudo.setMode('edicao');
    }
};

JSDialogEdit.Editor.Idioma = function (idioma) {
    var self = this;
    var _idioma;
    var componentes = [];
    var elementos = [];
    
    this.setIdioma = function ___jsdialogedit_editor_idioma_setIdioma(v) {
        if(v === _idioma) return;
        
        if(document.getElementById("jsdeIdiomaResource")) document.getElementsByTagName('head')[0].removeChild(document.getElementById("jsdeIdiomaResource"));
        
        var script = document.createElement("script");
        script.id = "jsdeIdiomaResource";
        script.type = "text/javascript";
        script.src = "idioma/" + v + ".js";
        script.onload = function ___jsdialogedit_editor_idioma_defineIdioma_onload() {
            _idioma = v;
            atualizaItens();
        };
        document.getElementsByTagName('head')[0].appendChild(script);
    };
    this.addElemento = function ___jsdialogedit_editor_idioma_additem(elemento, propriedade) {
        elementos.push({"elemento" : elemento, "propriedade" : propriedade, "valor" : elemento[propriedade]});
    };
    this.addComponente = function ___jsdialogedit_editor_idioma_additem(elemento, propriedade) {
        componentes.push({
            "elemento" : elemento,
            "propriedade" : "set" + propriedade,
            "valor" : elemento["get" + propriedade]()
        });
    };
    
        
    var atualizaItens = function ___jsdialogedit_editor_idioma_atualizaItem() {
        var item, x;
        
        for(x = 0; x < elementos.length; x++) {
            item = elementos[x];
            item.elemento[item.propriedade] = ___JSDEIDIOMA[item.valor];
        }
        
        for(x = 0; x < componentes.length; x++) {
            item = componentes[x];
            item.elemento[item.propriedade](___JSDEIDIOMA[item.valor]);
        }
    };
    
    var init = function () {
        if(idioma) self.setIdioma(idioma);
    };
    
    init();
}

JSDialogEdit.Editor.Acao = function () {
    this.acao;
    this.objeto;
    this.propriedade;
    this.valor;
}

/**
 * @class {static final} JSDialogEdit.Editor
 * @function {void} executar
 * Metodo estatico para abrir o Editor de Caixas de Dialogo
 */
JSDialogEdit.Editor.executar = function ___jsde_editor_outer_executar() {
    if(window.__jsdialogedit === 'executanto') {
        alert('Editor ja esta sendo executando');
        return;
    }
    
    var janCaixaFerramentas, janPropriedades, janSaida, janComponentes, janCssExterno,
        barraFerramentas, barraMenu, divDrop, divSelecao, novo, arvoreComponentes,
        divProp, divEvt, divPropAba, divAbaProp, divAbaEvt, divEstilo, idEstiloBase,
        documentos = [],
        docSelecionado = null,
        objSelecionado = null,
        count = {},
        folhasEstilo = [],
        GRADE = 10,
        editandoProriedade = false,
        ultimaURLRede = null,
        areaTransferencia = null,
        estilo = null,
        editorIdioma = null;
    
    var novoDocumento = function ___jsde_editor_inner_novodocumento(e) {
        if(!count[JSDialogEdit.Editor.Documento.CLASSE]) count[JSDialogEdit.Editor.Documento.CLASSE] = 0;
        var d = new JSDialogEdit.Editor.Documento({
            "nome" : "SemTitulo" + (++count[JSDialogEdit.Editor.Documento.CLASSE]),
            "classe" : JSDialogEdit.Janela,
            "propriedades" : {
                "dataCriacao" : (new Date()).getTime(),
                "numeroVersao" : 0
            }
        });
        d.conteudo.setAcaoFechar(JSDialogEdit.Janela.AoFechar.DESTROY);
        documentos.push(d);
        configDocumento(documentos.length - 1);
        fimAplicarEstilo();
    };
    
    var configDocumento = function ___jsde_editor_inner_configdocumento(doc) {
        documentos[doc].conteudo.setMode('edicao');
        documentos[doc].conteudo.setOnCloseFunction(function() {
            var obj = this;
            var indice = localizaDocumento(this);
            if(documentos[indice].alterado) {
                JSDialogEdit.Janela.Mensagem({
                    "titulo"   : "JSDialogEdit",
                    "mensagem" : "Deseja salvar as modificações do documento '" + this.getTitulo() + "' antes de fechar?",
                    "botoes"   : ['Sim', 'Não', 'Cancelar'],
                    "icone"    : JSDialogEdit.Janela.Mensagem.Icone.QUESTAO,
                    "retorno"  : function(v){fechaDocumento.call(obj, v);}
                });
                return false;
            } else {
                fechaDocumento.call(obj, 'Não');
                return false;
            }
        });
        documentos[doc].conteudo.setSuperior(20 * doc + 60);
        documentos[doc].conteudo.setEsquerda(20 * doc + 10);
        documentos[doc].conteudo.registraEvento('dblclick', function ___jsde_editor_inner_documentos_conteudo_inner_dblclick(e) {
            e = e || event;
            var _target = e.target ? e.target : e.srcElement;
            if(documentos[docSelecionado].conteudo !== this) selecionaDocumento(localizaDocumento(this));
            if(_target.id.indexOf(this.getId()) != -1) {
                selecionaObjeto(documentos[docSelecionado].conteudo);
                if(objSelecionado.eventoPadrao) carregaEditorEvento.call({"id":"evt_" + objSelecionado.eventoPadrao}, e);
            } else if(_target.id == 'jsde_divSelecao') { //.indexOf(objSelecionado.getId()) != -1) {
                if(objSelecionado.eventoPadrao) carregaEditorEvento.call({"id":"evt_" + objSelecionado.eventoPadrao}, e);
            }
            
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            
            return false;
        });
        documentos[doc].conteudo.registraEvento('mouseup', function ___jsde_editor_inner_documentos_conteudo_inner_mouseup(e) {
            e = e || event;
            var _target = e.target ? e.target : e.srcElement;
            selecionaDocumento(localizaDocumento(this));
            if(_target.id.indexOf(this.getId()) != -1) selecionaObjeto(documentos[docSelecionado].conteudo);
            adicionaComponente.call(this, e);
        });

        selecionaDocumento(doc);
        selecionaObjeto(documentos[doc].conteudo);
        adicionaMenuDocumento(doc);
    }
    
    var adicionaMenuDocumento = function ___jsde_editor_inner_adicionaMenuDocumento(indice) {
        var documento = documentos[indice];
        var menu = new JSDialogEdit.MenuItem({
            "ID"    : "doc" + documento.nome,
            "Texto" : documento.nome,
            "Icone" : JSDialogEdit.pastaImagens + documento.conteudo.CLASSE.replace('JSDialogEdit.', '') + '.png'
        });
        menu.setOnClickFunction(function(){
            var nome = this.getTexto();
            for(var x = 0; x < documentos.length; x++) {
                if(documentos[x].nome === nome) {
                    selecionaDocumento(x);
                    break;
                }
            }
        });
        barraMenu.getFilho("jsdeMenuJanelas").addFilho(menu);
    }
    
    var removeMenuDocumento = function ___jsde_editor_inner_removeMenuDocumento(indice) {
        var menu = barraMenu.getFilho("jsdeMenuJanelas");
        menu.removeFilho(menu.filhoAt(indice));
    }
    
    var localizaDocumento = function ___jsde_editor_inner_localizadocumento(obj) {
        for(var i = 0; i < documentos.length; i++) {
            if(documentos[i].conteudo === obj) return i;
        }
        return undefined;
    }
    
    var adicionaComponente = function ___jsde_editor_inner_adicionacomponente(e) {
        if(!novo) return;
        e = e || event;
        var novoObjeto, elem, t, l, pai, paiX, paiY;
        
        novoObjeto = new novo();
        if((novoObjeto instanceof JSDialogEdit.MenuConteiner ||
            novoObjeto instanceof JSDialogEdit.Conexao ||
            novoObjeto instanceof JSDialogEdit.CampoOculto) &&
            !(this instanceof JSDialogEdit.Janela)) return;
        
        elem = this.getElemento() || (e.target || e.srcElement);
        
        if(elem.getBoundingClientRect !== undefined &&
           elem.getBoundingClientRect().top !== undefined &&
           elem.getBoundingClientRect().height !== undefined) {
            paiX = elem.getBoundingClientRect().left;
            paiY = elem.getBoundingClientRect().top;
            if(this instanceof JSDialogEdit.Janela) paiY += elem.firstChild.clientHeight;
        } else {
            pai = elem.parentNode;
            paiX = elem.offsetLeft;
            paiY = elem.offsetTop;
            if(elem.className.indexOf('jsdeJanela ') != -1) {
                paiY += elem.firstChild.clientHeight;
            } else {
                while(pai != document.body) {
                    if(pai.tagName.toUpperCase() == 'FORM') {
                        pai = pai.parentNode;
                        continue;
                    }
                    paiX += pai.offsetLeft;
                    paiY += pai.offsetTop;
                    pai = pai.parentNode;
                }
            }
        }
        if(e.clientX) {
            l = Math.round((e.clientX - paiX) / GRADE) * GRADE;
            t = Math.round((e.clientY - paiY) / GRADE) * GRADE;
        } else {
            l = t = 0;
        }
        
        if(!count[novoObjeto.CLASSE]) count[novoObjeto.CLASSE] = 0;
        novoObjeto.setId(novoObjeto.CLASSE.split('.')[1]+(++count[novoObjeto.CLASSE]));
        if(novoObjeto instanceof JSDialogEdit.Componente) {
            novoObjeto.setSuperior(t);
            novoObjeto.setEsquerda(l);
        }
        
        configComponente(novoObjeto);
        try {
            this.addFilho(novoObjeto);
        } catch(ex) {
            alert('Erro:' + ex);
        }
        
        novo = null;
        divDrop.style.display = 'none';
        atualizaSaida();
        recarregaArvore();
        selecionaObjeto(novoObjeto);
        documentoAlterado(true);
        fimAplicarEstilo();
        
        var itemDesfazer = new JSDialogEdit.Editor.Acao();
        itemDesfazer.acao = "adicionar";
        itemDesfazer.objeto = novoObjeto;
        itemDesfazer.propriedade = this;
        adicionaDesfazer(itemDesfazer);
    }
    
    var configComponente = function ___jsde_editor_inner_configcomponente(novoObjeto) {
        var move = null;
        
        var ___jsde_editor_inner_configcomponente_inner_fclick = function (e) {
                e = e ? e : event;
                selecionaObjeto(novoObjeto);
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
            }
        
        if(novoObjeto instanceof JSDialogEdit.Componente) {
            novoObjeto.getElemento().style.position = 'absolute';
            novoObjeto.getElemento().style.cursor = 'default';
            novoObjeto.getElemento().readonly = 'readonly';
            novoObjeto.setArrastavel(true);
            novoObjeto.registraEvento('click', ___jsde_editor_inner_configcomponente_inner_fclick);
            novoObjeto.registraEvento('dblclick', function ___jsde_editor_inner_configcomponente_inner_fdblclick(e) {
                e = e || event;
                selecionaObjeto(novoObjeto);
                if(objSelecionado.eventoPadrao !== null) carregaEditorEvento.call({"id":"evt_" + objSelecionado.eventoPadrao}, e);
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
            });
            novoObjeto.registraEvento('mousemove', function ___jsde_editor_inner_configcomponente_novoobjeto_inner_mouseup(e) {
                if(move) move = "move";
            });
            novoObjeto.registraEvento('mouseup', function ___jsde_editor_inner_configcomponente_novoobjeto_inner_mouseup(e) {
                e = e ? e : event;
                var _target = e.target || e.srcElement;
                
                // Caso esteja movendo o Componente com o mouse
                if(move === "move") {
                    var y = parseInt(this.getElemento().style.top, 10);
                    var x = parseInt(this.getElemento().style.left, 10);
                    this.setSuperior((Math.round(y/JSDialogEdit.dragGrade)*JSDialogEdit.dragGrade));
                    this.setEsquerda((Math.round(x/JSDialogEdit.dragGrade)*JSDialogEdit.dragGrade));
                    move = null;
                }
                
                // Caso esteja adicionando um novo Componente com o mouse
                if(this instanceof JSDialogEdit.Conteiner) {
                    adicionaComponente.call(this, e);
                } else if(this instanceof JSDialogEdit.PainelAbas && _target.className.indexOf('jsdeTabPainelConteudo') != -1) {
                    adicionaComponente.call(this.getFilho(_target.id.replace('_conteudo', '')), e);
                }
            });

            novoObjeto.setCallback('onfocus', function ___jsde_editor_inner_configcomponente_novoobjeto_inner_focus() {this.blur()});
            novoObjeto.setCallback('onclick', function ___jsde_editor_inner_configcomponente_novoobjeto_inner_click() {return false});
            novoObjeto.setCallback('onmousedown', function ___jsde_editor_inner_configcomponente_novoobjeto_inner_mousedown(e) {
                e = e ? e : event;
                var _target = e.target ? e.target : e.srcElement;
                if(novoObjeto instanceof JSDialogEdit.Conteiner && _target != this) return;
                if(novoObjeto.getLayout && novoObjeto.getLayout() !== JSDialogEdit.Conteiner.TiposLayout.NONE) return;
                if(novoObjeto instanceof JSDialogEdit.PainelAbas && _target != this && _target.className.indexOf("jsdeTabPainel") == -1) return;
                divSelecao.style.display = 'none';
                JSDialogEdit.dragComp = novoObjeto;
                JSDialogEdit.dragGrade = GRADE;
                this.blur();
                move = "down";
            });
        } else {
            if(novoObjeto.getElementoDesign().addEventListener) {
                novoObjeto.getElementoDesign().addEventListener('click', ___jsde_editor_inner_configcomponente_inner_fclick, false);
            } else if(novoObjeto.getElementoDesign().attachEvent) {
                novoObjeto.getElementoDesign().attachEvent('onclick', ___jsde_editor_inner_configcomponente_inner_fclick);
            }
        }
    }
    
    var removeComponente = function ___jsde_editor_inner_removecomponente() {
        if(objSelecionado == null || objSelecionado instanceof JSDialogEdit.Janela) return;
        var i, excluido, novaSelecao, lista, posicao, achou;
        
        excluido = objSelecionado.getId();
        lista = documentos[docSelecionado].conteudo.getFilhos();
        for(i = 0; i < lista.length; i++) {
            if(lista[i].getId() == excluido) break;
        }
        
        novaSelecao = i == 0 ? documentos[docSelecionado].conteudo : lista[i - 1];
        objSelecionado.getConteiner().removeFilho(objSelecionado);
        
        var no = arvoreComponentes.findFilho("jsdeTree_" + excluido);
        no.getConteiner().removeFilho(no);

        var itemDesfazer = new JSDialogEdit.Editor.Acao();
        itemDesfazer.acao = "remover";
        itemDesfazer.objeto = objSelecionado;
        itemDesfazer.propriedade = objSelecionado.getConteiner();
        adicionaDesfazer(itemDesfazer);

        atualizaSaida();
        // recarregaArvore();
        selecionaObjeto(novaSelecao);
        documentoAlterado(true);
    }
    
    var componenteAnterior = function ___jsde_editor_inner_componenteanterior() {
        if(objSelecionado == null) return;
        
        var lista = documentos[docSelecionado].conteudo.getFilhos();
        var id = objSelecionado.getId();
        if(lista.length == 0) return;
        if(objSelecionado instanceof JSDialogEdit.Janela) {
            selecionaObjeto(lista[lista.length - 1]);
            return;
        }
        
        if(id == lista[0].getId()) {
            selecionaObjeto(documentos[docSelecionado].conteudo);
            return;
        }
        for(var i = 0; i < lista.length; i++) {
            if(lista[i].getId() == id) {
                selecionaObjeto(lista[i - 1]);
                return;
            }
        }
    }
    
    var componenteSeguinte = function ___jsde_editor_inner_componenteseguinte() {
        if(objSelecionado == null) return;
        
        var id = objSelecionado.getId();
        
        if(objSelecionado === documentos[docSelecionado].conteudo) {
            selecionaObjeto(objSelecionado.getFilhos()[0] || documentos[docSelecionado].conteudo);
            return;
        }
        
        if(objSelecionado instanceof JSDialogEdit.Conteiner || objSelecionado.getFilhos) {
            if(objSelecionado.getFilhos().length > 0) {
                selecionaObjeto(objSelecionado.getFilhos()[0]);
                return;
            }
        }
        
        if(objSelecionado.getConteiner) {
            selecionaObjeto(buscaComponenteSeguinte(objSelecionado.getConteiner(), id));
        }
    }
    
    var buscaComponenteSeguinte = function ___jsde_editor_inner_buscaComponenteSeguinte(conteiner, id) {
        var lista = conteiner.getFilhos();
        for(var x = 0; x < lista.length - 1; x++) {
            if(lista[x].getId() === id) {
                return lista[x + 1];
            }
        }
        
        if(conteiner === documentos[docSelecionado].conteudo) {
            return conteiner; //documentos[docSelecionado].conteudo;
        }
        
        if(conteiner.getConteiner) {
            return buscaComponenteSeguinte(conteiner.getConteiner(), conteiner.getId());
        }
    }
    
    var buscaComponenteAnterior = function ___jsde_editor_inner_buscaComponenteAnterior(conteiner, id) {
        var lista = conteiner.getFilhos();
    }
    
    var redimencionaComponente = function ___jsde_editor_inner_redimencionacomponente(direcao, deslocamento) {
        if (
            objSelecionado == null ||
            !(objSelecionado instanceof JSDialogEdit.Componente) ||
            (
                objSelecionado.getLayout &&
                objSelecionado.getLayout() !== JSDialogEdit.Conteiner.TiposLayout.NONE &&
                (direcao == 37 || direcao == 39)
            ) ||
            !(document.getElementById(objSelecionado.getId()))
           ) return;
        
        var itemDesfazer = new JSDialogEdit.Editor.Acao();
        itemDesfazer.acao = "resize";
        itemDesfazer.objeto = objSelecionado;
        itemDesfazer.propriedade = [objSelecionado.getPropriedade("Largura"), objSelecionado.getPropriedade("Altura")];
        itemDesfazer.valor = [objSelecionado.getLargura(), objSelecionado.getAltura()];
        adicionaDesfazer(itemDesfazer);
        
        switch(direcao) {
            case 37: // ESQUERDA
                objSelecionado.setLargura(objSelecionado.getLargura() - deslocamento);
                break;
            case 38: // CIMA
                objSelecionado.setAltura(objSelecionado.getAltura() - deslocamento);
                break;
            case 39: // DIREITA
                objSelecionado.setLargura(objSelecionado.getLargura() + deslocamento);
                break;
            case 40: // BAIXO
                objSelecionado.setAltura(objSelecionado.getAltura() + deslocamento);
                break;
            default:
                break;
        }
        
        atualizaSaida();
        carregarPropriedades();
        atualizaSelecao();
        documentoAlterado(true);
    }
    
    var reposicionaComponente = function ___jsde_editor_inner_reposicionacomponente(direcao, deslocamento) {
        var itemDesfazer, superior, esquerda;
        if(
           objSelecionado == null ||
           !(objSelecionado instanceof JSDialogEdit.Componente) ||
           (objSelecionado.getLayout && objSelecionado.getLayout() !== JSDialogEdit.Conteiner.TiposLayout.NONE) ||
           !(document.getElementById(objSelecionado.getId()))
          ) return;
        
        if(!(objSelecionado instanceof JSDialogEdit.Janela) &&
            (objSelecionado instanceof JSDialogEdit.Objeto)) {
            itemDesfazer = new JSDialogEdit.Editor.Acao();
            itemDesfazer.acao = "drag";
            itemDesfazer.objeto = objSelecionado;
            itemDesfazer.propriedade = [objSelecionado.getPropriedade("Superior"), objSelecionado.getPropriedade("Esquerda")];
            itemDesfazer.valor = [objSelecionado.getSuperior(), objSelecionado.getEsquerda()];
            adicionaDesfazer(itemDesfazer);
        }
        
        switch(direcao) {
            case 37: // ESQUERDA
                if(deslocamento === 1) {
                    esquerda = objSelecionado.getEsquerda() - deslocamento;
                } else {
                    esquerda = Math.round((objSelecionado.getEsquerda() - deslocamento) / GRADE) * GRADE;
                }
                objSelecionado.setEsquerda(esquerda);
                break;
            case 38: // CIMA
                if(deslocamento === 1) {
                    superior = objSelecionado.getSuperior() - deslocamento;
                } else {
                    superior = Math.round((objSelecionado.getSuperior() - deslocamento) / GRADE) * GRADE;
                }
                objSelecionado.setSuperior(superior);
                break;
            case 39: // DIREITA
                if(deslocamento === 1) {
                    esquerda = objSelecionado.getEsquerda() + deslocamento;
                } else {
                    esquerda = Math.round((objSelecionado.getEsquerda() + deslocamento) / GRADE) * GRADE;
                }
                objSelecionado.setEsquerda(esquerda);
                break;
            case 40: // BAIXO
                if(deslocamento === 1) {
                    superior = objSelecionado.getSuperior() + deslocamento;
                } else {
                    superior = Math.round((objSelecionado.getSuperior() + deslocamento) / GRADE) * GRADE;
                }
                objSelecionado.setSuperior(superior);
                break;
            default:
                break;
        }
        
        atualizaSaida();
        carregarPropriedades();
        atualizaSelecao();
        documentoAlterado(true);
    }
    
    var criaCaixaDialogoAbrirSalvar = function ___jsde_editor_inner_criacaixadialogoabrirsalvar(modo) {
        var dialog = {"classe":"JSDialogEdit.Janela","atributos":
                        {"ID":"JSDESaveOpenDialog","Largura":490,"Altura":294,"Tipo":3,"AcaoFechar":1,"FocoInicial":"JSDESaveOpenDialog_txtNomeArquivo"},
                        "filhos":[
                            {"classe":"JSDialogEdit.Rotulo","atributos":
                                {
                                    "ID":"JSDESaveOpenDialog_lblLocal","Valor": ___JSDEIDIOMA["Local"] || "Local:","Largura":36,"Superior":8,"Esquerda":75,
                                    "Estilos":{"fontFamily":"verdana, arial","fontSize":"9pt"},"Referencia":"JSDESaveOpenDialog_txtLocalArquivo"
                                }
                            },{"classe":"JSDialogEdit.CaixaTexto","atributos":
                                {
                                    "ID":"JSDESaveOpenDialog_txtLocalArquivo","Valor":"<<Local Storage>>","Largura":330,"Superior":5,
                                    "Esquerda":117,"SomenteLeitura":true,"Estilos":{"borderWidth":"1px"}
                                }
                            },{"classe":"JSDialogEdit.Imagem","atributos":
                                {
                                    "ID":"JSDESaveOpenDialog_imgPesquisaRede","Superior":8,"Esquerda":460,"Visivel":false,
                                    "Imagem":JSDialogEdit.pastaImagens+"icon_seta_direita.png","Tooltip":"Carregar lista da URL"
                                }
                            },{"classe":"JSDialogEdit.Painel","atributos":
                                {
                                    "ID":"JSDESaveOpenDialog_pnlLocais","Largura":100,"Altura":224,"Superior":36,"Esquerda":5,
                                    "Estilos":{"background":"#E6E6E6"}
                                },"filhos":[
                                    {"classe":"JSDialogEdit.Botao","atributos":
                                        {
                                            "ID":"JSDESaveOpenDialog_btnComputador","Valor":___JSDEIDIOMA["Computador Local"] || "Computador Local","Largura":100,"Superior":0,
                                            "Esquerda":0,"Estilos":{},"Tipo":"button","OnFocus":""
                                        }
                                    },{"classe":"JSDialogEdit.Botao","atributos":
                                        {
                                            "ID":"JSDESaveOpenDialog_btnRede","Valor":___JSDEIDIOMA["Rede"] || "Rede","Largura":100,"Superior":70,"Esquerda":0,
                                            "Estilos":{},"Tipo":"button","OnFocus":""
                                        }
                                    },{"classe":"JSDialogEdit.Botao","atributos":
                                        {
                                            "ID":"JSDESaveOpenDialog_btnRecente","Valor":___JSDEIDIOMA["Recentes"] || "Recentes","Largura":100,"Superior":140,"Esquerda":0,
                                            "Estilos": {},"Tipo": "button"
                                        }
                                    }
                                ]
                            },{"classe":"JSDialogEdit.Painel","atributos":
                                {
                                    "ID":"JSDESaveOpenDialog_pnlArquivos","Largura":360,"Altura":130,"Superior":36,"Esquerda":115,
                                    "Estilos":{"overflow":"auto"
                                }
                                },"filhos":[]
                            },{"classe":"JSDialogEdit.Rotulo","atributos":
                                {
                                    "ID":"JSDESaveOpenDialog_lblNome","Valor":___JSDEIDIOMA["Nome"] || "Nome","Largura":36,"Superior":180,"Esquerda":117,
                                    "Estilos":{"fontFamily":"verdana,arial","fontSize":"9pt"},"Referencia":"JSDESaveOpenDialog_txtNomeArquivo"
                                }
                            },{"classe":"JSDialogEdit.CaixaTexto","atributos":
                                {
                                    "ID":"JSDESaveOpenDialog_txtNomeArquivo","Largura":200,"Superior":180,"Esquerda":160,
                                    "Estilos":{"borderWidth":"1px"}
                                }
                            },{"classe":"JSDialogEdit.Rotulo","atributos":
                                {
                                    "ID":"JSDESaveOpenDialog_lblTipo","Valor":___JSDEIDIOMA["Tipo"] || "Tipo","Largura":26,"Superior":220,"Esquerda":117,
                                    "Estilos":{"fontFamily":"verdana, arial","fontSize":"9pt"},"Referencia":"JSDESaveOpenDialog_lstTipoArquivo"
                                }
                            },{"classe":"JSDialogEdit.ListaSelecao","atributos":
                                {
                                    "ID":"JSDESaveOpenDialog_lstTipoArquivo","Valor":"json","Largura":204,"Superior":220,"Esquerda":160,
                                    "Estilos":{"borderWidth":"1px"},"Opcoes":{"Arquivo JSON (*.json)":"json","Arquivo XML (*.xml)":"xml"}
                                }
                            },{"classe":"JSDialogEdit.Botao","atributos":
                                {
                                    "ID":"JSDESaveOpenDialog_btnAcao","Valor":"Indefinido","Largura":100,"Superior":180,"Esquerda":380,
                                    "Estilos":{},"Tipo":"cancel"
                                }
                            },{"classe":"JSDialogEdit.Botao","atributos":
                                {
                                    "ID":"JSDESaveOpenDialog_btnCancela","Valor":___JSDEIDIOMA["Cancelar"] || "Cancelar","Largura":100,"Superior":220,"Esquerda":380,
                                    "Estilos":{},"Tipo":"cancel"
                                }
                            }
                        ]
                    }
        
        var janDialogo = JSDialogEdit.parseDialog(dialog);
        janDialogo.setOnCloseFunction(function(){editandoProriedade = false;});
        if(ultimaURLRede !== null) {
            janDialogo.JSDESaveOpenDialog_txtLocalArquivo.setValor(ultimaURLRede);
            janDialogo.JSDESaveOpenDialog_imgPesquisaRede.setVisivel(true);
        } else if(docSelecionado !== null && documentos[docSelecionado].storage == "rede") {
            janDialogo.JSDESaveOpenDialog_txtLocalArquivo.setValor(documentos[docSelecionado].storageURL);
            janDialogo.JSDESaveOpenDialog_imgPesquisaRede.setVisivel(true);
        }
        var destino = janDialogo.JSDESaveOpenDialog_pnlArquivos;
        
        janDialogo.findFilho('JSDESaveOpenDialog_btnComputador').registraEvento('click', function(e) {
            var campo = janDialogo.JSDESaveOpenDialog_txtLocalArquivo;
            var destino = janDialogo.JSDESaveOpenDialog_pnlArquivos;
            janDialogo.JSDESaveOpenDialog_imgPesquisaRede.setVisivel(false);
            
            campo.setValor('<<Local Storage>>');
            campo.setSomenteLeitura(true);
            carregaURL.call(this);
        });
        
        janDialogo.findFilho('JSDESaveOpenDialog_btnRede').registraEvento('click', function(e) {
            var campo = janDialogo.JSDESaveOpenDialog_txtLocalArquivo;
            campo.setValor(ultimaURLRede || document.location.href);
            campo.setSomenteLeitura(false);
            janDialogo.JSDESaveOpenDialog_imgPesquisaRede.setVisivel(true);
            janDialogo.JSDESaveOpenDialog_pnlArquivos.removeTodosFilhos();
            if(ultimaURLRede !== null) carregaURL.call(janDialogo.JSDESaveOpenDialog_lstTipoArquivo);
        });
        
        janDialogo.findFilho('JSDESaveOpenDialog_btnRecente').registraEvento('click', function(e){
            var campo = janDialogo.JSDESaveOpenDialog_txtLocalArquivo;
            var destino = janDialogo.JSDESaveOpenDialog_pnlArquivos;
            janDialogo.JSDESaveOpenDialog_imgPesquisaRede.setVisivel(false);
            
            campo.setValor(___JSDEIDIOMA['<<Arquivos Recentes>>'] || '<<Arquivos Recentes>>');
            campo.setSomenteLeitura(true);
            carregaURL.call(this);
        });
        
        var carregaURL = function(e) {
            var x, nome;
            var url = this.getConteiner().findFilho('JSDESaveOpenDialog_txtLocalArquivo').getValor();
            var tipo = this.getConteiner().findFilho('JSDESaveOpenDialog_lstTipoArquivo').getValor();
            
            if(url == '') {
                alert('Informe o endereco da aplicacao que retorna a lista de arquivos');
                return true;
            } else if(url == '<<Local Storage>>') {
                destino.removeTodosFilhos();
                if(window['localStorage']) {
                    for(x = 0; x < window.localStorage.length; x++) {
                        nome = window.localStorage.key(x);
                        if(nome.indexOf('.' + tipo) == -1) continue;
                        adicionaArquivoLista(nome, destino, 'JSDESaveOpenDialog_txtNomeArquivo');
                    }
                } else {
                    alert('LocalStorage nao disponivel')
                }
                return true;
            } else if(url == (___JSDEIDIOMA['<<Arquivos Recentes>>'] || '<<Arquivos Recentes>>')) {
                destino.removeTodosFilhos();
                var lista = retornaRecentes();
                for(var i = 0; i < lista.length; i++) adicionaArquivoLista(lista[i].nome, destino, 'JSDESaveOpenDialog_txtNomeArquivo');
                return true;
            } else {
                ultimaURLRede = url;
            }
            
            var j = new JSDialogEdit.Ajax();
            janDialogo.JSDESaveOpenDialog_imgPesquisaRede.setImagem(JSDialogEdit.pastaImagens + 'loading.gif');
            j.request({
                'url' : url + '?tipo=' + tipo,
                'metodo' : function(lista) {
                    if(lista.charAt(0) != '[') {
                        alert("Retorno da aplicacao invalido:\n'"+lista+"'");
                        return;
                    }
                    
                    lista = JSON.parse(lista);
                    var destino = janDialogo.JSDESaveOpenDialog_pnlArquivos;
                    destino.removeTodosFilhos();
                    for(var x = 0; x < lista.length; x++) {
                        adicionaArquivoLista(lista[x], destino, 'JSDESaveOpenDialog_txtNomeArquivo');
                    }
                    janDialogo.JSDESaveOpenDialog_imgPesquisaRede.setImagem(JSDialogEdit.pastaImagens + 'icon_seta_direita.png');
                },
                'erro' : function(msg, erro) {
                    alert("Houve um erro " + erro + " requisitando a pagina:\n" + msg);
                    janDialogo.JSDESaveOpenDialog_imgPesquisaRede.setImagem(JSDialogEdit.pastaImagens + 'icon_seta_direita.png');
                }
            });
            
            return true;
        };
    
        var adicionaArquivoLista = function(nome, destino, opcao) {
            var item = new JSDialogEdit.Rotulo({
                ID:nome,
                Valor:nome+'<br>',
                Estilos:{"cursor":"pointer"}
            });
            item.registraEvento('click', function(e) {
                document.getElementById(opcao).value = this.getId();
            });
            item.registraEvento('dblclick', function(e) {
                this.getConteiner().findFilho('JSDESaveOpenDialog_btnAcao').click();
            });
            destino.addFilho(item);
        }
        
        janDialogo.JSDESaveOpenDialog_txtLocalArquivo.registraEvento('change', carregaURL);
        janDialogo.JSDESaveOpenDialog_imgPesquisaRede.registraEvento('click', carregaURL);
        janDialogo.JSDESaveOpenDialog_lstTipoArquivo.registraEvento('change', carregaURL);
        
        if(modo == "Abrir") {
            janDialogo.setTitulo(___JSDEIDIOMA["Abrir"] || "Abrir");
            janDialogo.setIcone(JSDialogEdit.pastaImagens+"icon_pasta.gif");
            janDialogo.JSDESaveOpenDialog_btnAcao.setValor(___JSDEIDIOMA['Abrir'] || 'Abrir');
        
            janDialogo.JSDESaveOpenDialog_btnAcao.registraEvento('click', function(e) {
                var estrutura = {};
                var r, json, url, ajax, recent = null;
                
                estrutura.formato = this.getConteiner().JSDESaveOpenDialog_lstTipoArquivo.getValor();
                estrutura.nome = this.getConteiner().JSDESaveOpenDialog_txtNomeArquivo.getValor();
                estrutura.storageURL = this.getConteiner().JSDESaveOpenDialog_txtLocalArquivo.getValor();
                
                if(estrutura.nome === '') return;
                
                if(estrutura.storageURL === '<<Local Storage>>') {
                    estrutura.storageURL = null;
                    estrutura.storage = 'local';
                } else if(estrutura.storageURL == (___JSDEIDIOMA['<<Arquivos Recentes>>'] || '<<Arquivos Recentes>>')) {
                    recent = JSON.parse(window.localStorage['ArquivosRecentes']);
                    for(r = 0; r < recent.length; r++) {
                        if(recent[r].nome === estrutura.nome || recent[r].nome === (estrutura.nome + '.' + estrutura.formato)) {
                            estrutura.storageURL = recent[r].local;
                            estrutura.storage = recent[r].local == null ? 'local' : 'rede';
                            estrutura.formato = recent[r].formato;
                            break;
                        }
                    }
                } else {
                    estrutura.storage = 'rede';
                }
            
                abrirEstrutura(estrutura)
            });
        } else if(modo == "Salvar") {
            janDialogo.setTitulo(___JSDEIDIOMA["Salvar"] || "Salvar");
            janDialogo.setIcone(JSDialogEdit.pastaImagens+"icon_disco.gif");
            janDialogo.JSDESaveOpenDialog_btnAcao.setValor(___JSDEIDIOMA['Salvar'] || 'Salvar');
            janDialogo.findFilho('JSDESaveOpenDialog_btnRecente').setVisivel(false);
            
            janDialogo.JSDESaveOpenDialog_btnAcao.registraEvento('click', function(e) {
                var nome = this.getConteiner().JSDESaveOpenDialog_txtNomeArquivo.getValor();
                var formato = this.getConteiner().JSDESaveOpenDialog_lstTipoArquivo.getValor();
                if(nome.indexOf('.'+formato) == -1) nome += '.' + formato;
                
                documentos[docSelecionado].nome = nome;
                documentos[docSelecionado].formato = formato;
                documentos[docSelecionado].storageURL = this.getConteiner().JSDESaveOpenDialog_txtLocalArquivo.getValor();
                if(documentos[docSelecionado].storageURL == '<<Local Storage>>') documentos[docSelecionado].storageURL = null;
                documentos[docSelecionado].storage = documentos[docSelecionado].storageURL ? 'rede' : 'local';
                documentos[docSelecionado].propriedades.dataCriacao = (new Date()).getTime();
                salvarDocumento();
            });
        } else {
            throw "InvalidDialogModeException";
        }
        
        carregaURL.call(janDialogo.JSDESaveOpenDialog_lstTipoArquivo);
        return janDialogo;
    }
    
    var fechaDocumento = function ___jsde_editor_inner_fechadocumento(v) {
        var indice = localizaDocumento(this);
        if(v === null || v === 'Cancelar') return;
        
        if(documentos[indice].alterado && v === 'Sim') {
            if(!documentos[docSelecionado].formato) {
                salvarComo();
                return;
            } else {
                salvarDocumento();
            }
        }
        
        this.removeTodosFilhos();
        
        delete documentos[indice].conteudo;
        delete documentos[indice];
        documentos.splice(indice, 1);
        this.getConteiner().removeFilho(this);
        
        removeMenuDocumento(indice);
        
        indice = documentos.length - 1;
        if(indice >= 0) {
            docSelecionado = null;
            documentos[indice].conteudo.setAtiva(true);
            selecionaDocumento(indice);
            selecionaObjeto(documentos[indice].conteudo);
        } else {
            selecionaDocumento(undefined);
            selecionaObjeto(undefined);
			barraFerramentas.btnSalvar.setDesabilitado(true);
			barraFerramentas.btnSalvarComo.setDesabilitado(true);
        }
    }
    
    var salvar = function ___jsde_editor_inner_salvar() {
        if(docSelecionado === null) return;
        if(!documentos[docSelecionado].alterado) return;
        if(!documentos[docSelecionado].formato) {
            salvarComo();
        } else {
            salvarDocumento();
        }
    };
    
    var abrir = function ___jsde_editor_inner_abrir() {
        editandoProriedade = true;
        criaCaixaDialogoAbrirSalvar("Abrir");
    };
    
    var abrirEstrutura = function ___jsde_editor_inner_abrirestrutura(estrutura) {
        var i, json, xml, url, ajax, recent, item, menuItem;
        
        for(i = 0; i <= documentos.length - 1; i++) {
            if(documentos[i].nome == estrutura.nome) {
                selecionaDocumento(i);
                selecionaObjeto(documentos[i].conteudo);
                return;
            }
        }
        
        if(estrutura.storage == 'local' && estrutura.formato == 'json') {
            json = JSON.parse(window.localStorage.getItem(estrutura.nome));
            abrirDocumentoJson(estrutura, json);
        } else if(estrutura.storage == 'local' && estrutura.formato == 'xml') {
            xml = window.localStorage.getItem(estrutura.nome);
            xml = JSDialogEdit.XML.String2xml(xml);
            json = xml2json(xml);
            abrirDocumentoJson(estrutura, json);
        } else if(estrutura.storage != 'local' && estrutura.formato == 'json') {
            url = estrutura.storageURL + '?nome=' + estrutura.nome + '&tipo=' + estrutura.formato;
            ajax = new JSDialogEdit.Ajax();
            ajax.request({
                'url' : url,
                'metodo' : function(retorno) {
                    if(retorno.charAt(0) != '{') {
                        alert(retorno);
                        return;
                    }
                    var json = JSON.parse(retorno);
                    abrirDocumentoJson(estrutura, json);
                },
                'assincrono' : false,
                'erro' : function(msg, erro) {
                    alert("Houve um erro " + erro + " requisitando a pagina " + estrutura.storageURL + ":\n" + msg);
                }
            });
        } else if(estrutura.storage != 'local' && estrutura.formato == 'xml') {
            url = estrutura.storageURL + '?nome=' + estrutura.nome + '&tipo=' + estrutura.formato;
            ajax = new JSDialogEdit.Ajax();
            ajax.requestXML({
                'url' : url,
                'metodo' : function(retorno) {
                    var json = xml2json(retorno);
                    abrirDocumentoJson(estrutura, json);
                },
                'assincrono' : false,
                'erro' : function(msg, erro) {
                    alert("Houve um erro " + erro + " requisitando a pagina " + estrutura.storageURL + ":\n" + msg);
                }
            });
        }
    
        if(window['localStorage']) {
            recent = window.localStorage['ArquivosRecentes'] === undefined ? [] : JSON.parse(window.localStorage['ArquivosRecentes']);
            for(var r = 0; r < recent.length; r++) {
                if(recent[r].nome === estrutura.nome ||
                   recent[r].nome === (estrutura.nome + '.' + estrutura.formato)) {
                  return;
                }
            }
            item = {    
                "local" : estrutura.storageURL,
                "nome" : estrutura.nome,
                "formato" : estrutura.formato
            };
            barraMenu.findFilho("jsdeMenuRecentes").addFilho(criaItemMenuRecente(item));
            recent.push(item);
            window.localStorage['ArquivosRecentes'] = JSON.stringify(recent);
        } else {
            alert('LocalStorage nao disponivel')
        }
    }
    
    var carregarCSS = function ___jsde_editor_inner_carregarcss() {
        if(!janCssExterno) {
            janCssExterno = JSDialogEdit.parseDialog(
                {"classe":"JSDialogEdit.Janela","atributos":{"ID":"jsde_jnlCSSExterno","Largura":443,
                "Altura":300,"Status":false,"Tipo":3,"Icone":"imagens/icon_css.png",
                "Titulo":"Carregar CSS Externo","AcaoFechar":3,"Exibicao":"hidden","OnCreate":
                "var estrutura = [\n    {\n        \"CSS\":\"string\",\n        \"link\":\"object\"\n"+
                "    },\n    []\n];\n\nthis.jsde_tblEstiloPersonalizado\n    .getFilho(\"jsde_tblEst"+
                "iloPersonalizado_Coluna2\")\n    .setCampo(\"CSS\");\nthis.jsde_cnxEstiloPersonaliz"+
                "ado.setFonteDados(estrutura);\nthis.jsde_cnxEstiloPersonalizado.vincularDados();"},
                "filhos":[{"classe":"JSDialogEdit.Conexao","atributos":{"ID":"jsde_cnxEstiloPersonalizado",
                "Parametros":{},"Metodo":"post","TipoDados":"xml","FormatoDados":"jsde"}},{"classe":
                "JSDialogEdit.Tabela","atributos":{"ID":"jsde_tblEstiloPersonalizado","Largura":440,
                "Altura":220,"Superior":1,"Esquerda":1,"Conector":"jsde_cnxEstiloPersonalizado",
                "Visivel":true,"Grade":1,"AutoVincular":false,"Redimensiona":false,"MoverColunas":false,
                "OnChangeRowSelected":"var selecao = this.getLinhasSelecionadas();\nvar btn = this.g"+
                "etConteiner().jsde_btnEstiloPersonalizadoRemover;\n\nif(selecao.length > 0) {\n   b"+
                "tn.setDesabilitado(false);\n} else {\n   btn.setDesabilitado(true);\n}\n",
                "OnEditRow":"/*\nvar registro = row.getRegistro();\nvar pnl = this.getConteiner().jsde_pnlEs"+
                "tiloPersonalizado;\n\npnl.jsde_txtEstiloPersonalizado.setValor(registro.CSS);\npnl"+
                "[\"action\"] = row;\npnl.setVisivel(true);\npnl.jsde_txtEstiloPersonalizado.focus()"+
                ";\n*/"},"filhos":[{"classe":"JSDialogEdit.Tabela.Coluna","atributos":{"ID":"jsde_tb"+
                "lEstiloPersonalizado_Coluna1","Titulo":"&#10004;","Tipo":"selecao","Largura":36}},
                {"classe":"JSDialogEdit.Tabela.Coluna","atributos":{"ID":"jsde_tblEstiloPersonalizado_Coluna2",
                "Titulo":"CSS","Tipo":"string","Largura":402}}]},{"classe":"JSDialogEdit.Botao",
                "atributos":{"ID":"jsde_btnEstiloPersonalizadoAdicionar","Valor":"Adicionar","Largura":88,
                "Superior":240,"Esquerda":250,"Estilos":{"backgroundImage":"linear-gradient(to botto"+
                "m, #FFFFFF, #D6D6D6)","border":"1px solid #000000","borderRadius":"4px","padding":"2px 5px"},
                "TabIndex":1,"Desabilitado":false,"Visivel":true,"Tipo":"button","OnMouseOut":"this."+
                "getElemento()\n    .style\n    .backgroundImage = \"linear-gradient(to bottom, #FFF"+
                "FFF, #D6D6D6)\";\n","OnMouseDown":"this.getElemento()\n    .style\n    .backgroundI"+
                "mage = \"linear-gradient(to top, #FFFFFF, #B0B0B0)\";\n","OnMouseUp":"this.getEleme"+
                "nto()\n    .style\n    .backgroundImage = \"linear-gradient(to bottom, #FFFFFF, #D6"+
                "D6D6)\";\n","OnClick":"var pnl = this.getConteiner().jsde_pnlEstiloPersonalizado;\n"+
                "\npnl.jsde_txtEstiloPersonalizado.setValor(\"\");\npnl[\"action\"] = \"add\";\npnl."+
                "setVisivel(true);\npnl.jsde_txtEstiloPersonalizado.focus();\n"}},{"classe":"JSDialogEdit.Botao",
                "atributos":{"ID":"jsde_btnEstiloPersonalizadoRemover","Valor":"Remover","Largura":88,
                "Superior":240,"Esquerda":340,"Estilos":{"backgroundImage":"linear-gradient(to botto"+
                "m, #FFFFFF, #D6D6D6)","border":"1px solid #000000","borderRadius":"4px","padding":"2px 5px"},
                "TabIndex":2,"Desabilitado":true,"Visivel":true,"Tipo":"button","OnMouseOut":
                "this.getElemento()\n    .style\n    .backgroundImage = \"linear-gradient(to bottom,"+
                " #FFFFFF, #D6D6D6)\";\n","OnMouseDown":"this.getElemento()\n    .style\n    .backgr"+
                "oundImage = \"linear-gradient(to top, #FFFFFF, #B0B0B0)\";\n","OnMouseUp":
                "this.getElemento()\n    .style\n    .backgroundImage = \"linear-gradient(to bottom,"+
                " #FFFFFF, #D6D6D6)\";\n","OnClick":"var head = document.getElementsByTagName(\"head\")[0];"+
                "\nvar conn = this\n           .getConteiner()\n           .jsde_cnxEstiloPersonaliz"+
                "ado;\nvar lista = this\n            .getConteiner()\n            .jsde_tblEstiloPer"+
                "sonalizado\n            .getLinhasSelecionadas();\nvar indices = []\n\nfor(var x = "+
                "0; x < lista.length; x++) {\n   indices.push(lista[x].getIndice());\n   head.remove"+
                "Child(lista[x].getRegistro().link);\n}\n\nconn.removeRegistros(indices);\nthis.setD"+
                "esabilitado(true);\n"}},{"classe":
                "JSDialogEdit.Painel","atributos":{"ID":"jsde_pnlEstiloPersonalizado","Estilos":
                {"background":"#FFFFFF"},"Visivel":false,"Layout":"centro"},"filhos":[{"classe":
                "JSDialogEdit.Botao","atributos":{"ID":"jsde_btnEstiloPersonalizadoOk","Valor":"Ok",
                "Largura":88,"Superior":40,"Esquerda":220,"Estilos":{"backgroundImage":"linear-gradi"+
                "ent(to bottom, #FFFFFF, #D6D6D6)","border":"1px solid #000000","borderRadius":"4px",
                "padding":"2px 5px"},"TabIndex":4,"Desabilitado":false,"Visivel":true,"Tipo":"button",
                "OnMouseOut":"this.getElemento()\n    .style\n    .backgroundImage = \"linear-gradie"+
                "nt(to bottom, #FFFFFF, #D6D6D6)\";\n","OnMouseDown":"this.getElemento()\n    .style"+
                "\n    .backgroundImage = \"linear-gradient(to top, #FFFFFF, #B0B0B0)\";\n","OnMouseUp":
                "this.getElemento()\n    .style\n    .backgroundImage = \"linear-gradient(to bottom,"+
                " #FFFFFF, #D6D6D6)\";\n","OnClick":"var registro, link;\nvar conn = this.getContein"+
                "er().getConteiner().jsde_cnxEstiloPersonalizado;\nvar conteiner = this.getConteiner"+
                "();\nvar css = conteiner.jsde_txtEstiloPersonalizado.getValor().trim();\n\nif(css.l"+
                "ength > 0) {\n    if(\n        conn.filtrar(function (item) {\n            return i"+
                "tem.CSS === css;\n        }).length > 0) {\n        alert(\"Este arquivo já foi inc"+
                "luido!\");\n        return false;\n    }\n    \n    link = document.createElement(\"link\");"+
                "\n    link.rel = \"stylesheet\";\n    link.type = \"text/css\";\n    link.href = cs"+
                "s;\n    \n    registro = {\n        \"CSS\" : css,\n        \"link\" : link\n    };"+
                "\n\n    if(conteiner[\"action\"] === \"add\") {\n       conn.novoRegistro(registro);"+
                "\n    } else {\n        document\n            .getElementsByTagName(\"head\")[0]\n "+
                "           .removeChild(conteiner[\"action\"].link);\n        conn.alterarRegistro("+
                "conteiner[\"action\"].getIndice(), registro);\n    }\n    \n    document.getElement"+
                "sByTagName(\"head\")[0].appendChild(link);\n    conteiner.setVisivel(false);\n    r"+
                "eturn true;\n} else {\n    return false;\n}\n"}},{"classe":"JSDialogEdit.Botao",
                "atributos":{"ID":"jsde_btnEstiloPersonalizadoCancelar","Valor":"Cancelar","Largura":
                88,"Superior":40,"Esquerda":310,"Estilos":{"backgroundImage":"linear-gradient(to bot"+
                "tom, #FFFFFF, #D6D6D6)","border":"1px solid #000000","borderRadius":"4px","padding":
                "2px 5px"},"TabIndex":5,"Desabilitado":false,"Visivel":true,"Tipo":"button","OnMouseOut":
                "this.getElemento()\n    .style\n    .backgroundImage = \"linear-gradient(to bottom,"+
                " #FFFFFF, #D6D6D6)\";\n","OnMouseDown":"this.getElemento()\n    .style\n    .backgr"+
                "oundImage = \"linear-gradient(to top, #FFFFFF, #B0B0B0)\";\n","OnMouseUp":
                "this.getElemento()\n    .style\n    .backgroundImage = \"linear-gradient(to bottom,"+
                " #FFFFFF, #D6D6D6)\";\n","OnClick":"this.getConteiner().setVisivel(false);"}},
                {"classe":"JSDialogEdit.CaixaTexto","atributos":{"ID":"jsde_txtEstiloPersonalizado",
                "Largura":350,"Superior":10,"Esquerda":50,"Estilos":{"fontFamily":"verdana,arial",
                "fontSize":"14px"},"TabIndex":3,"Desabilitado":false,"Visivel":true,"SomenteLeitura":
                false,"Obrigatorio":false,"OnKeyPress":"var key = e.keyCode;\nvar pnl = this.getCont"+
                "einer();\n\nif(key == 27) {\n   e.cancelBubble = true;\n   if (e.stopPropagation) e"+
                ".stopPropagation();\n   pnl.jsde_btnEstiloPersonalizadoCancelar.click();\n   return"+
                " false;\n} else if(key == 13) {\n   e.cancelBubble = true;\n   if (e.stopPropagatio"+
                "n) e.stopPropagation();\n   pnl.jsde_btnEstiloPersonalizadoOk.click();\n   return f"+
                "alse;\n}"}},{"classe":"JSDialogEdit.Rotulo","atributos":{"ID":"jsde_lblEstiloPerson"+
                "alizado","Valor":"CSS","Largura":29,"Superior":10,"Esquerda":10,"Estilos":{"fontFamily":
                "verdana,arial","fontSize":"14px"},"Visivel":true,"Referencia":"jsde_txtEstiloPersonalizado"
                }}]}]}
            );
            
            janCssExterno.setOnCloseFunction(function(){
                editandoProriedade = false;
                var dados = janCssExterno.jsde_cnxEstiloPersonalizado.getDados();
                for(var x = 0; x < dados.length; x++) {
                    folhasEstilo.push(dados[x].link);
                }
            });
        }
        
        janCssExterno.setVisivel(true);
        editandoProriedade = true;
        
        return;
        
        var jnl = JSDialogEdit.parseDialogURL({
            "url" : "exemplos/lista.php?nome=JanelaArquivoCSSExterno.json&tipo=json",
            "metodo" : function (j) {
                j.setVisivel(true);
            },
            "erro" : function (codigo, descricao) {
                alert(codigo + "\n" + descricao);
            }
        });
    }
    
    var copiar = function ___jsde_editor_inner_copiar() {
        if(objSelecionado !== null && !(objSelecionado instanceof JSDialogEdit.Janela)) {
            var codigo = objSelecionado.toObject();
            areaTransferencia = JSON.stringify(codigo);
			barraFerramentas.btnColar.setDesabilitado(false);
        }
        // netscape.security.PrivilegeManager.enablePrivilege("UniversalPreferencesRead")
        // var div = document.createElement('iframe');
        // document.body.appendChild(div);
        // div.style.position = 'absolute';
        // div.contentWindow.document.body.contentEditable = true;
        // div.contentWindow.document.body.innerHTML = areaTransferencia;
        // div.contentWindow.document.execCommand('copy');
    }
    
    var recortar = function ___jsde_editor_inner_recortar() {
        if(objSelecionado !== null) {
            copiar();
            removeComponente();
			barraFerramentas.btnColar.setDesabilitado(false);
        }
    }
    
    var colar = function ___jsde_editor_inner_colar(e) {
        if(objSelecionado !== null && areaTransferencia !== null) {
            var obj = JSON.parse(areaTransferencia);
            novo = eval(obj.classe);
            
            if(objSelecionado instanceof JSDialogEdit.Conteiner) {
                adicionaComponente.call(objSelecionado, e);
            } else {
                adicionaComponente.call(objSelecionado.getConteiner(), e);
            }
            
            for(var p in obj.atributos) {
                if(p === 'ID') continue;
                objSelecionado[objSelecionado.getPropriedade(p).set](obj.atributos[p]);
            }
            
            selecionaObjeto(objSelecionado);
        }
    }
    
    var capturarEstilo = function ___jsde_editor_inner_capturarestilo() {
        var prop = objSelecionado.getPropriedade("Estilos");
        if(!prop || !prop.habilitado) return;
        
        if(estilo === null) {
            document.getElementById("btnAplicarEstilo").className = 'jsde_Botao jsde_Botao_precionado';
            estilo = objSelecionado.getEstilos();
            idEstiloBase = objSelecionado.getId();
            divEstilo.style.display = "block";
            divSelecao.parentNode.insertBefore(divEstilo, divSelecao);
            editandoProriedade = true;
            atualizaDivEstilo();
            document.body.className = 'duplicarEstilo';
        } else {
            fimAplicarEstilo();
        }
    }
    
    var aplicarEstilo = function ___jsde_editor_inner_aplicarestilo(c) {
        if(estilo === null) return;
        
        var prop = c.getPropriedade("Estilos");
        if(!prop || !prop.habilitado) return;
        
        c.setEstilos(estilo);
        documentoAlterado(true);
    }
    
    var fimAplicarEstilo = function ___jsde_editor_inner_fimaplicarestilo() {
        if(estilo === null) return;
        
        estilo = null;
        idEstiloBase = null;
        divEstilo.style.display = "none";
        document.getElementById("btnAplicarEstilo").className = 'jsde_Botao';
        editandoProriedade = false;
        document.body.className = '';
    }
    
    var atualizaDivEstilo = function ___jsde_editor_inner_atualizaDivEstilo() {
        if(divEstilo.style.display == "none" || objSelecionado.getId() != idEstiloBase) return;
        
        divEstilo.style.top = (parseInt(divSelecao.style.top, 10) - 5) + "px";
        divEstilo.style.left = (parseInt(divSelecao.style.left, 10) - 5) + "px";
        divEstilo.style.width = divSelecao.style.width;
        divEstilo.style.height = divSelecao.style.height;
    }
    
    var retornaRecentes = function ___jsde_editor_inner_retornarecentes() {
        var x, nome, lista = [];
        
        if(window['localStorage']) {
            for(x = 0; x < window.localStorage.length; x++) {
                nome = window.localStorage.key(x);
                if(nome !== 'ArquivosRecentes') continue;
                lista = JSON.parse(window.localStorage[nome]);
                break;
            }
        } else {
            alert('LocalStorage nao disponivel');
        }
        
        return lista;
    }
    
    var importar = function ___jsde_editor_inner_importar() {
        editandoProriedade = true;
        var j = criaJanelaImportarExportar("Importar");
        
        j.setTitulo("Importar");
        j.setOnCloseFunction(function(){editandoProriedade = false});
        
        j.lstFormato.registraEvento('change', function(){
            j.txtCodigoFonte.setValor("");
        });
        
        j.btnImportar.registraEvento('click', function(){
            var estrutura, json, codigo = j.txtCodigoFonte.getValor();
            
            if(codigo === "") {
                alert("Nenhum codigo a ser importado")
                return;
            }
            
            try {
                if(j.lstFormato.getValor() == 'xml') {
                    codigo = JSDialogEdit.XML.String2xml(codigo);
                    json = xml2json(codigo);
                } else {
                    json = JSON.parse(codigo);
                }
                
                estrutura = {"nome":json.atributos.ID};
                abrirDocumentoJson(estrutura, json);
            } catch (ex) {
                alert("Nao foi possivel fazera  importação:" + ex)
            }
        });
    }
    
    var exportar = function ___jsde_editor_inner_exportar() {
        editandoProriedade = true;
        var j = criaJanelaImportarExportar("Importar");
        j.setTitulo("Exportar");
        j.setOnCloseFunction(function(){editandoProriedade = false});
        j.btnImportar.setVisivel(false);
        j.txtCodigoFonte.setValor(janSaida.txtSaida.getValor());
        j.txtCodigoFonte.setSomenteLeitura(true);
        j.txtCodigoFonte.select();
        j.lstFormato.registraEvento('change', function(){
            j.txtCodigoFonte.setValor("");
            
            if(this.getValor() == "json") {
                j.txtCodigoFonte.setValor(janSaida.txtSaida.getValor());
            } else {
                if(docSelecionado != null) {
                    j.txtCodigoFonte.setValor(
                        JSDialogEdit.XML.xml2String(
                            documentos[docSelecionado].conteudo.toXml()
                        )
                    );
                }
            }
            
            j.txtCodigoFonte.select();
        });
    }
    
    var propriedadesArquivo = function ___jsde_editor_inner_propriedadesarquivo() {
        if(docSelecionado == null) return;
        
        editandoProriedade = true;
        
        var janela = JSDialogEdit.parseDialog(
            {"classe":"JSDialogEdit.Janela","atributos":{"ID":"jsdeJanelaPropriedadesArquivo","Largura":442,"Altura":322,
            "Status":false,"Tipo":3,"Titulo":"Propriedades de ","AcaoFechar":1,"Exibicao":"hidden","OnCreate":""},
            "filhos":[{"classe":"JSDialogEdit.Conexao","atributos":{"ID":"jsde_connPropriedades","Metodo":"javascript",
            "FormatoDados":"jsde"}},{"classe":"JSDialogEdit.PainelAbas","atributos":{"ID":"jsde_pnlPropriedades","Largura":420,
            "Altura":250,"Superior":10,"Esquerda":10,"Estilos":{},"Visivel":true,"ExibeFecharAba":false,"MoverAbas":false},
            "filhos":[{"classe":"JSDialogEdit.PainelAbas.Aba","atributos":{"ID":"jsde_pnlPropriedades_Geral","Titulo":"Geral"},
            "filhos":[{"classe":"JSDialogEdit.Rotulo","atributos":{"ID":"jsde_lblPropriedadeNomeArquivo","Valor":"Nome do Arquivo:",
            "Largura":135,"Superior":10,"Esquerda":10,"Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Visivel":true,
            "Referencia":"jsde_txtPropriedadeNomeArquivo"}},{"classe":"JSDialogEdit.CaixaTexto",
            "atributos":{"ID":"jsde_txtPropriedadeNomeArquivo","Largura":250,"Superior":10,"Esquerda":150,"Estilos":{"border":"none"},
            "Desabilitado":false,"Visivel":true,"SomenteLeitura":true,"Obrigatorio":false}},{"classe":"JSDialogEdit.Rotulo",
            "atributos":{"ID":"jsde_lblPropriedadeTipoArquivo","Valor":"Tipo de Documento:","Largura":135,"Superior":40,
            "Esquerda":10,"Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Visivel":true,"Referencia":"jsde_txtPropriedadeTipoArquivo"}},
            {"classe":"JSDialogEdit.CaixaTexto","atributos":{"ID":"jsde_txtPropriedadeTipoArquivo","Largura":250,
            "Superior":40,"Esquerda":150,"Estilos":{"border":"none"},"Desabilitado":false,"Visivel":true,"SomenteLeitura":true,
            "Obrigatorio":false}},{"classe":"JSDialogEdit.Rotulo","atributos":{"ID":"jsde_lblPropriedadeFormatoArquivo",
            "Valor":"Formato do Arquivo:","Largura":135,"Superior":70,"Esquerda":10,"Estilos":{"fontFamily":"Arial",
            "fontSize":"14px"},"Visivel":true,"Referencia":"jsde_txtPropriedadeFormatoArquivo"}},{"classe":"JSDialogEdit.CaixaTexto",
            "atributos":{"ID":"jsde_txtPropriedadeFormatoArquivo","Largura":250,"Superior":70,"Esquerda":150,
            "Estilos":{"border":"none"},"Desabilitado":false,"Visivel":true,"SomenteLeitura":true,"Obrigatorio":false}},
            {"classe":"JSDialogEdit.Rotulo","atributos":{"ID":"jsde_lblPropriedadeLocalArquivo","Valor":"Local:","Largura":135,
            "Superior":100,"Esquerda":10,"Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Visivel":true,
            "Referencia":"jsde_txtPropriedadeLocalArquivo"}},{"classe":"JSDialogEdit.CaixaTexto",
            "atributos":{"ID":"jsde_txtPropriedadeLocalArquivo","Largura":250,"Superior":100,"Esquerda":150,"Estilos":{"border":"none"},
            "Desabilitado":false,"Visivel":true,"SomenteLeitura":true,"Obrigatorio":false}},{"classe":"JSDialogEdit.Rotulo",
            "atributos":{"ID":"jsde_lblPropriedadeTamanhoArquivo","Valor":"Tamanho:","Largura":135,"Superior":130,"Esquerda":10,
            "Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Visivel":true,"Referencia":"jsde_txtPropriedadeTamanhoArquivo"}},
            {"classe":"JSDialogEdit.CaixaTexto","atributos":{"ID":"jsde_txtPropriedadeTamanhoArquivo","Largura":250,"Superior":130,
            "Esquerda":150,"Estilos":{"border":"none"},"Desabilitado":false,"Visivel":true,"SomenteLeitura":true,"Obrigatorio":false}},
            {"classe":"JSDialogEdit.Rotulo","atributos":{"ID":"jsde_lblPropriedadeDataCriacao","Valor":"Criado em:",
            "Largura":135,"Superior":160,"Esquerda":10,"Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Visivel":true,
            "Referencia":"jsde_txtPropriedadeDataCriacao"}},{"classe":"JSDialogEdit.CaixaTexto",
            "atributos":{"ID":"jsde_txtPropriedadeDataCriacao","Largura":250,"Superior":160,"Esquerda":150,"Estilos":{"border":"none"},
            "Desabilitado":false,"Visivel":true,"SomenteLeitura":true,"Obrigatorio":false}},{"classe":"JSDialogEdit.Rotulo",
            "atributos":{"ID":"jsde_lblPropriedadeDataModificacao","Valor":"Modificado em:","Largura":135,"Superior":190,"Esquerda":10,
            "Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Visivel":true,"Referencia":"jsde_txtPropriedadeDataModificacao"}},
            {"classe":"JSDialogEdit.CaixaTexto","atributos":{"ID":"jsde_txtPropriedadeDataModificacao","Largura":250,
            "Superior":190,"Esquerda":150,"Estilos":{"border":"none"},"Desabilitado":false,"Visivel":true,"SomenteLeitura":true,
            "Obrigatorio":false}}]},{"classe":"JSDialogEdit.PainelAbas.Aba","atributos":{"ID":"jsde_pnlPropriedades_Detalhes",
            "Titulo":"Detalhes"},"filhos":[{"classe":"JSDialogEdit.Rotulo","atributos":{"ID":"jsde_lblPropriedadeAutor",
            "Valor":"Autor:","Largura":84,"Superior":10,"Esquerda":10,"Estilos":{"fontFamily":"Arial","fontSize":"14px"},
            "Visivel":true,"Referencia":"jsde_txtPropriedadeAutor"}},{"classe":"JSDialogEdit.CaixaTexto",
            "atributos":{"ID":"jsde_txtPropriedadeAutor","Largura":250,"Superior":10,"Esquerda":150,"Estilos":{},"Desabilitado":false,
            "Visivel":true,"SomenteLeitura":false,"Obrigatorio":false}},{"classe":"JSDialogEdit.Rotulo",
            "atributos":{"ID":"jsde_lblPropriedadeProjeto","Valor":"Projeto:","Largura":91,"Superior":40,"Esquerda":10,
            "Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Visivel":true,"Referencia":"jsde_txtPropriedadeProjeto"}},
            {"classe":"JSDialogEdit.CaixaTexto","atributos":{"ID":"jsde_txtPropriedadeProjeto","Largura":250,"Superior":40,
            "Esquerda":150,"Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Desabilitado":false,"Visivel":true,"SomenteLeitura":false,
            "Obrigatorio":false}},{"classe":"JSDialogEdit.Rotulo","atributos":{"ID":"jsde_lblPropriedadeStatus","Valor":"Status:",
            "Largura":87,"Superior":70,"Esquerda":10,"Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Visivel":true,
            "Referencia":"jsde_txtPropriedadeStatus"}},{"classe":"JSDialogEdit.CaixaTexto","atributos":{"ID":"jsde_txtPropriedadeStatus",
            "Largura":250,"Superior":70,"Esquerda":150,"Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Desabilitado":false,
            "Visivel":true,"SomenteLeitura":false,"Obrigatorio":false}},{"classe":"JSDialogEdit.Rotulo",
            "atributos":{"ID":"jsde_lblPropriedadeComentario","Valor":"Comentário:","Largura":91,"Superior":100,"Esquerda":10,
            "Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Visivel":true,"Referencia":"jsde_txtPropriedadeComentario"}},
            {"classe":"JSDialogEdit.Memorando","atributos":{"ID":"jsde_txtPropriedadeComentario","Largura":250,"Altura":100,
            "Superior":100,"Esquerda":150,"Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Desabilitado":false,"Visivel":true,"SomenteLeitura":false,
            "Obrigatorio":false}}]},{"classe":"JSDialogEdit.PainelAbas.Aba","atributos":{"ID":"jsde_pnlPropriedades_Estatistica",
            "Titulo":"Estatísticas"},"filhos":[{"classe":"JSDialogEdit.Rotulo","atributos":{"ID":"jsde_lblPropriedadeNumeroVersao",
            "Valor":"Número da Versão:","Largura":124,"Superior":10,"Esquerda":10,"Estilos":{"fontFamily":"Arial","fontSize":"14px"},
            "Visivel":true}},{"classe":"JSDialogEdit.CaixaTexto","atributos":{"ID":"jsde_txtPropriedadeNumeroVersao","Largura":250,
            "Superior":10,"Esquerda":150,"Estilos":{"border":"none"},"Desabilitado":false,"Visivel":true,"SomenteLeitura":true,
            "Obrigatorio":false}},{"classe":"JSDialogEdit.Rotulo","atributos":{"ID":"jsde_lblPropriedadeNumeroObjetos",
            "Valor":"Número de Objetos:","Largura":124,"Superior":40,"Esquerda":10,"Estilos":{"fontFamily":"Arial","fontSize":"14px"},
            "Visivel":true}},{"classe":"JSDialogEdit.CaixaTexto","atributos":{"ID":"jsde_txtPropriedadeNumeroObjetos","Largura":250,
            "Superior":40,"Esquerda":150,"Estilos":{"border":"none"},"Desabilitado":false,"Visivel":true,"SomenteLeitura":true,
            "Obrigatorio":false}}]},{"classe":"JSDialogEdit.PainelAbas.Aba","atributos":{"ID":"jsde_pnlPropriedades_Personalizadas",
            "Titulo":"Propriedades Personalizadas"},"filhos":[{"classe":"JSDialogEdit.Tabela",
            "atributos":{"ID":"jsde_tblPropriedadePersonalizada","Largura":394,"Altura":170,"Superior":10,"Esquerda":10,
            "Conector":"jsde_connPropriedades","Visivel":true,"Grade":0,"AutoVincular":true,"Redimensiona":true,"MoverColunas":false,
            "OnChangeRowSelected":"var selecao = this.getLinhasSelecionadas();\nvar btn = this.getConteiner().jsde_btnPropri" +
            "edadeRemover;\n\nif(selecao.length > 0) {\n   btn.setDesabilitado(false);\n} else {\n   btn.setDesabilitado(tru" +
            "e);\n}\n","OnEditRow":"var registro = row.getRegistro();\nvar pnl = this.getConteiner().jsde_pnlPropriedadePers" +
            "onalizada;\n\npnl.jsde_txtPersonalizadaValor_texto.setValor(\"\");\npnl.jsde_txtPersonalizadaValor_numero.setVa" +
            "lor(\"\");\npnl.jsde_txtPersonalizadaValor_data.setValor(\"\");\npnl.jsde_txtPersonalizadaValor_logico.setValor" +
            "(\"\");\n\npnl.jsde_txtPersonalizadaNome.setValor(registro.nome);\npnl.jsde_lstPersonalizadaTipo.setValor(regis" +
            "tro.tipo);\npnl[\"jsde_txtPersonalizadaValor_\" + registro.tipo].setValor(registro.valor);\n\npnl.jsde_txtPerso" +
            "nalizadaValor_texto.setVisivel(false);\npnl.jsde_txtPersonalizadaValor_numero.setVisivel(false);\npnl.jsde_txtP" +
            "ersonalizadaValor_data.setVisivel(false);\npnl.jsde_txtPersonalizadaValor_logico.setVisivel(false);\npnl[\"jsde" +
            "_txtPersonalizadaValor_\" + registro.tipo].setVisivel(true);\n\npnl[\"action\"] = row.getIndice();\n\npnl.setVi" +
            "sivel(true);\n"},"filhos":[{"classe":"JSDialogEdit.Tabela.Coluna","atributos":{"ID":"jsde_colPropriedadeSelecao",
            "Titulo":"&#10004;","Tipo":"selecao"}}]},{"classe":"JSDialogEdit.Botao","atributos":{"ID":"jsde_btnPropriedadeRemover",
            "Valor":"Remover","Largura":88,"Superior":190,"Esquerda":320,
            "Estilos":{"backgroundImage":"linear-gradient(to bottom, #FFFFFF, #D6D6D6)","border":"1px solid #000000",
            "borderRadius":"4px","padding":"2px 5px"},"Desabilitado":true,"Visivel":true,"Tipo":"button",
            "OnClick":"var conn = this\n           .getConteiner()\n           .findFilho(\"jsde_connPropriedades\");\nvar l" +
            "ista = this\n            .getConteiner()\n            .jsde_tblPropriedadePersonalizada\n            .getLinhas" +
            "Selecionadas();\nvar indices = []\n\nfor(var x = 0; x < lista.length; x++) {\n   indices.push(lista[x].getIndic" +
            "e());\n}\n\nconn.removeRegistros(indices);\n\n"}},{"classe":"JSDialogEdit.Botao",
            "atributos":{"ID":"jsde_btnPropriedadeAdicionar","Valor":"Adicionar","Largura":88,"Superior":190,"Esquerda":230,
            "Estilos":{"backgroundImage":"linear-gradient(to bottom, #FFFFFF, #D6D6D6)","border":"1px solid #000000",
            "borderRadius":"4px","padding":"2px 5px"},"Desabilitado":false,"Visivel":true,"Tipo":"button",
            "OnClick":"var pnl = this.getConteiner().jsde_pnlPropriedadePersonalizada;\n\npnl.jsde_txtPersonalizadaNome.setV" +
            "alor(\"\");\npnl.jsde_lstPersonalizadaTipo.setValor(\"\");\npnl.jsde_txtPersonalizadaValor_texto.setValor(\"\")" +
            ";\npnl.jsde_txtPersonalizadaValor_numero.setValor(\"\");\npnl.jsde_txtPersonalizadaValor_data.setValor(\"\");\n" +
            "pnl.jsde_txtPersonalizadaValor_logico.setValor(\"\");\n\npnl.jsde_txtPersonalizadaValor_texto.setVisivel(true);" +
            "\npnl.jsde_txtPersonalizadaValor_numero.setVisivel(false);\npnl.jsde_txtPersonalizadaValor_data.setVisivel(fals" +
            "e);\npnl.jsde_txtPersonalizadaValor_logico.setVisivel(false);\n\npnl[\"action\"] = \"add\";\n\npnl.setVisivel(t" +
            "rue);\npnl.jsde_txtPersonalizadaNome.focus();"}},{"classe":"JSDialogEdit.Painel",
            "atributos":{"ID":"jsde_pnlPropriedadePersonalizada","Largura":416,"Altura":219,"Superior":0,"Esquerda":0,
            "Estilos":{"border":"none","backgroundColor":"#FFFFFF"},"Visivel":false},"filhos":[{"classe":"JSDialogEdit.Rotulo",
            "atributos":{"ID":"jsde_lblPersonalizadaNome","Valor":"Nome:","Largura":0,"Superior":10,"Esquerda":10,
            "Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Visivel":true}},{"classe":"JSDialogEdit.CaixaTexto",
            "atributos":{"ID":"jsde_txtPersonalizadaNome","Largura":320,"Superior":10,"Esquerda":70,"Estilos":{},
            "Desabilitado":false,"Visivel":true,"SomenteLeitura":false,"Obrigatorio":false,
            "OnKeyPress":"var key = e.keyCode;\nvar pnl = this.getConteiner();\n\nif(key == 27) {\n   e.cancelBubble = true;" +
            "\n   if (e.stopPropagation) e.stopPropagation();\n   pnl.jsde_btnPersonalizadaCancelar.click();\n   return fals" +
            "e;\n} else if(key == 13) {\n   e.cancelBubble = true;\n   if (e.stopPropagation) e.stopPropagation();\n   pnl.j" +
            "sde_btnPersonalizadaOk.click();\n   return false;\n}"}},{"classe":"JSDialogEdit.Rotulo",
            "atributos":{"ID":"jsde_lblPersonalizadaTipo","Valor":"Tipo:","Largura":0,"Superior":40,"Esquerda":10,
            "Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Visivel":true}},{"classe":"JSDialogEdit.Rotulo",
            "atributos":{"ID":"jsde_lblPersonalizadaValor","Valor":"Valor:","Largura":0,"Superior":70,"Esquerda":10,
            "Estilos":{"fontFamily":"Arial","fontSize":"14px"},"Visivel":true}},{"classe":"JSDialogEdit.CaixaTexto",
            "atributos":{"ID":"jsde_txtPersonalizadaValor_texto","Largura":320,"Superior":70,"Esquerda":70,"Estilos":{},
            "Desabilitado":false,"Visivel":true,"SomenteLeitura":false,"Obrigatorio":false,
            "OnKeyPress":"var key = e.keyCode;\nvar pnl = this.getConteiner();\n\nif(key == 27) {\n   e.cancelBubble = true;" +
            "\n   if (e.stopPropagation) e.stopPropagation();\n   pnl.jsde_btnPersonalizadaCancelar.click();\n   return fals" +
            "e;\n} else if(key == 13) {\n   e.cancelBubble = true;\n   if (e.stopPropagation) e.stopPropagation();\n   pnl.j" +
            "sde_btnPersonalizadaOk.click();\n   return false;\n}"}},{"classe":"JSDialogEdit.CaixaTexto",
            "atributos":{"ID":"jsde_txtPersonalizadaValor_numero","Largura":100,"Superior":70,"Esquerda":70,
            "Estilos":{"textAlign":"right"},"Desabilitado":false,"Visivel":false,"SomenteLeitura":false,"Obrigatorio":false,
            "OnKeyPress":"var key = e.keyCode;\nvar pnl = this.getConteiner();\n\nif(key == 27) {\n   e.cancelBubble = true;" +
            "\n   if (e.stopPropagation) e.stopPropagation();\n   pnl.jsde_btnPersonalizadaCancelar.click();\n   return fals" +
            "e;\n} else if(key == 13) {\n   e.cancelBubble = true;\n   if (e.stopPropagation) e.stopPropagation();\n   pnl.j" +
            "sde_btnPersonalizadaOk.click();\n   return false;\n}"}},{"classe":"JSDialogEdit.Botao",
            "atributos":{"ID":"jsde_btnPersonalizadaOk","Valor":"Ok","Largura":105,"Superior":110,"Esquerda":180,
            "Estilos":{"backgroundImage":"linear-gradient(to bottom, #F9F9F9 0%, #E6E6E6 51%, #CCCCCC 100%)",
            "border":"1px solid #000000","borderRadius":"4px","padding":"2px 5px"},"Desabilitado":false,"Visivel":true,
            "Tipo":"button","OnClick":"var pai   = this.getConteiner();\nvar nome  = pai.jsde_txtPersonalizadaNome.getValor(" +
            ");\nvar tipo  = pai.jsde_lstPersonalizadaTipo.getValor();\nvar valor = pai[\"jsde_txtPersonalizadaValor_\" + ti" +
            "po].getValor();\nvar registro = {\n   \"nome\"  : nome,\n   \"tipo\"  : tipo,\n   \"valor\" : valor\n};\n\nvar " +
            "conn = pai.findFilho(\"jsde_connPropriedades\");\n\nif(pai[\"action\"] == \"add\") {\n   conn.novoRegistro(regi" +
            "stro);\n} else {\n   conn.alterarRegistro(pai[\"action\"], registro);\n}\n\npai.setVisivel(false);\n\npai.getCo" +
            "nteiner().jsde_btnPropriedadeRemover.setDesabilitado(true);"}},{"classe":"JSDialogEdit.Botao",
            "atributos":{"ID":"jsde_btnPersonalizadaCancelar","Valor":"Cancelar","Largura":105,"Superior":110,"Esquerda":290,
            "Estilos":{"backgroundImage":"linear-gradient(to bottom, #F9F9F9 0%, #E6E6E6 51%, #CCCCCC 100%)",
            "border":"1px solid #000000","borderRadius":"4px","padding":"2px 5px"},"Desabilitado":false,"Visivel":true,
            "Tipo":"button","OnClick":"this.getConteiner().setVisivel(false);"}},{"classe":"JSDialogEdit.ListaSelecao",
            "atributos":{"ID":"jsde_lstPersonalizadaTipo","Valor":"texto","Largura":97,"Superior":40,"Esquerda":70,"Estilos":{},
            "Desabilitado":false,"Visivel":true,"Opcoes":{"Texto":"texto","Número":"numero","Data":"data","Sim ou Não":"logico"},
            "OnChange":"var conteiner = this.getConteiner();\nconteiner.jsde_txtPersonalizadaValor_texto.setVisivel(false);\n" +
            "conteiner.jsde_txtPersonalizadaValor_numero.setVisivel(false);\nconteiner.jsde_txtPersonalizadaValor_data.setVi" +
            "sivel(false);\nconteiner.jsde_txtPersonalizadaValor_logico.setVisivel(false);\n\nconteiner[\"jsde_txtPersonaliz" +
            "adaValor_\" + this.getValor()].setVisivel(true);\n"}},{"classe":"JSDialogEdit.CampoData",
            "atributos":{"ID":"jsde_txtPersonalizadaValor_data","Superior":70,"Esquerda":70,"Estilos":{},"Desabilitado":false,
            "Visivel":false,"SomenteLeitura":false,"Obrigatorio":false}},{"classe":"JSDialogEdit.GrupoBotaoRadio",
            "atributos":{"ID":"jsde_txtPersonalizadaValor_logico","Largura":70,"Altura":62,"Superior":50,"Esquerda":60,
            "Estilos":{"border":"none"},"Desabilitado":false,"Visivel":false,"Opcoes":{"Sim":"sim","Não":"nao"},"Titulo":" "}}]}]}]},
            {"classe":"JSDialogEdit.Botao","atributos":{"ID":"jsde_btnPropriedadesOk","Valor":"Ok","Largura":82,"Superior":270,
            "Esquerda":260,"Estilos":{"backgroundImage":"linear-gradient(to bottom, #F9F9F9 0%, #E6E6E6 51%, #CCCCCC 100%)",
            "border":"1px solid #000000","borderRadius":"4px","padding":"2px 5px"},"Desabilitado":false,"Visivel":true,
            "Tipo":"submit"}},{"classe":"JSDialogEdit.Botao","atributos":{"ID":"jsde_btnPropriedadesCancelar","Valor":"Cancelar",
            "Largura":82,"Superior":270,"Esquerda":350,
            "Estilos":{"backgroundImage":"linear-gradient(to bottom, #F9F9F9 0%, #E6E6E6 51%, #CCCCCC 100%)",
            "border":"1px solid #000000","borderRadius":"4px","padding":"2px 5px"},"Desabilitado":false,"Visivel":true,"Tipo":"cancel"}}]}
        );
        var estrutura = [{"nome":"string", "tipo":"string", "valor":"string"},[]];
        
        var tamanho;
        if(documentos[docSelecionado].formato == 'xml') {
            tamanho = JSDialogEdit.XML.xml2String(documentos[docSelecionado].toXml()).length;
        } else {
            tamanho = JSON.stringify(documentos[docSelecionado].toObject()).length;
        }
        var kb = (tamanho / 1000).toFixed(2);
        var qtdeObjetos = arvoreComponentes.getDescendentes().length;
        
        if(documentos[docSelecionado].propriedades.personalizadas) {
            estrutura[1] = documentos[docSelecionado].propriedades.personalizadas;
        }
        
        janela.setOnCloseFunction(function(){editandoProriedade = false});
        janela.setTitulo("Propriedades de " + documentos[docSelecionado].nome);
        janela.findFilho("jsde_txtPropriedadeNomeArquivo").setValor(documentos[docSelecionado].nome);
        janela.findFilho("jsde_txtPropriedadeTipoArquivo").setValor(documentos[docSelecionado].conteudo.CLASSE);
        janela.findFilho("jsde_txtPropriedadeFormatoArquivo").setValor(documentos[docSelecionado].formato);
        janela.findFilho("jsde_txtPropriedadeLocalArquivo").setValor(documentos[docSelecionado].storageURL || documentos[docSelecionado].storage);
        janela.findFilho("jsde_txtPropriedadeTamanhoArquivo").setValor(kb + " KB (" + tamanho + " bytes)");
        janela.findFilho("jsde_txtPropriedadeDataCriacao").setValor(formataData(documentos[docSelecionado].propriedades.dataCriacao) || "");
        janela.findFilho("jsde_txtPropriedadeDataModificacao").setValor(formataData(documentos[docSelecionado].propriedades.dataModificacao) || "");
        janela.findFilho("jsde_txtPropriedadeAutor").setValor(documentos[docSelecionado].propriedades.autor || "");
        janela.findFilho("jsde_txtPropriedadeProjeto").setValor(documentos[docSelecionado].propriedades.projeto || "");
        janela.findFilho("jsde_txtPropriedadeStatus").setValor(documentos[docSelecionado].propriedades.status || "");
        janela.findFilho("jsde_txtPropriedadeComentario").setValor(documentos[docSelecionado].propriedades.comentario || "");
        janela.findFilho("jsde_txtPropriedadeNumeroVersao").setValor(documentos[docSelecionado].propriedades.numeroVersao || "");
        janela.findFilho("jsde_txtPropriedadeNumeroObjetos").setValor(qtdeObjetos);
        janela.findFilho("jsde_btnPropriedadesOk").setOnClickFunction(function () {
            documentos[docSelecionado].propriedades.autor = janela.findFilho("jsde_txtPropriedadeAutor").getValor();
            documentos[docSelecionado].propriedades.projeto = janela.findFilho("jsde_txtPropriedadeProjeto").getValor();
            documentos[docSelecionado].propriedades.status = janela.findFilho("jsde_txtPropriedadeStatus").getValor();
            documentos[docSelecionado].propriedades.comentario = janela.findFilho("jsde_txtPropriedadeComentario").getValor();
            documentos[docSelecionado].propriedades.personalizadas = janela.jsde_connPropriedades.getDados();
            documentoAlterado(true);
        });
        janela.jsde_connPropriedades.setFonteDados(estrutura);
        janela.jsde_connPropriedades.vincularDados();
    }
    
    var criaJanelaImportarExportar = function ___jsde_editor_inner_criaJanelaImportarExportar() {
        var codigo = {
            "classe" : "JSDialogEdit.Janela",
            "atributos" : {
                "ID" : "jsdeImportarExportar",
                "Largura" : 345,
                "Altura" : 305,
                "Status" : false,
                "Tipo" : 3,
                "Titulo" : "Importar / Exportar",
                "AcaoFechar" : 1,
                "Exibicao" : "hidden",
                "FocoInicial" : "txtCodigoFonte"
            },
        "filhos":[
            {
                "classe" : "JSDialogEdit.Rotulo",
                "atributos" : {
                    "ID" : "lblFormato",
                    "Valor" : "Formato",
                    "Largura" : 53,
                    "Superior" : 13,
                    "Esquerda" : 10,
                    "Estilos" : {
                        "fontFamily" : "Arial",
                        "fontSize" : "14px"
                    },
                    "Visivel":true
                }
            },
            {
                "classe" : "JSDialogEdit.ListaSelecao",
                "atributos" : {
                    "ID" : "lstFormato",
                    "Valor" : "json",
                    "Largura" : 95,
                    "Superior" : 11,
                    "Esquerda" : 76,
                    "Estilos" : {},
                    "Desabilitado" : false,
                    "Visivel" : true,
                    "Opcoes" : {
                        "JSON" : "json",
                        "XML" : "xml"
                    }
                }
            },
            {
                "classe" : "JSDialogEdit.Memorando",
                "atributos" : {
                    "ID" : "txtCodigoFonte",
                    "Largura" : 320,
                    "Altura" : 230,
                    "Superior" : 40,
                    "Esquerda" : 10,
                    "Estilos" : {},
                    "Desabilitado" : false,
                    "Visivel" : true,
                    "SomenteLeitura" : false,
                    "Obrigatorio" : false,
                    "OnFocus" : "this.select()"
                }
            },
            {
                "classe" : "JSDialogEdit.Botao",
                "atributos" : {
                    "ID" : "btnImportar",
                    "Valor" : "Importar",
                    "Largura" : 100,
                    "Superior" : 10,
                    "Esquerda" : 184,
                    "Estilos" : {},
                    "Desabilitado" : false,
                    "Visivel" : true,
                    "Tipo" : "cancel"
                }
            }
        ]};
        
        return JSDialogEdit.parseDialog(codigo);
    }
    
    var formataData = function ___jsde_editor_inner_formataData(milisegundos) {
        if(!milisegundos) return null;
        var data = new Date(milisegundos);
        var formato =  data.getFullYear() + "-"
                    + ("0" + (data.getMonth() + 1)).substr((data.getMonth() + 1).toString().length - 1, 2) + "-"
                    + ("0" + data.getDate()).substr(data.getDate().toString().length - 1, 2) + " "
                    + ("0" + data.getHours()).substr(data.getHours().toString().length - 1, 2) + ":"
                    + ("0" + data.getMinutes()).substr(data.getMinutes().toString().length - 1, 2) + ":"
                    + ("0" + data.getSeconds()).substr(data.getSeconds().toString().length - 1, 2);
        return formato;
    };
    
    var xml2json = function ___jsde_editor_inner_xml2json(docXml) {
        if(docXml.firstChild.tagName.toUpperCase() == 'JSDIALOGEDIT') {
            return carregaObjetoXml(docXml.firstChild);
        } else {
            return carregaObjetoXmlVersao2(docXml.firstChild);
        }
    }
    
    var carregaObjetoXml = function ___jsde_editor_inner_carregaObjetoXml(objXml) {
        var obj = new Object();
        var jProp = objXml.firstChild;
        var jFilhos = jProp.nextSibling;
        
        obj.classe = objXml.getAttribute('classe');
        obj.atributos = new Object();
        
        var p = jProp.firstChild;
        while(p) {
            if(p.textContent.charAt(0) == '{') {
                obj.atributos[p.getAttribute('nome')] = JSON.parse(p.textContent);
            } else if(p.textContent == 'true') {
                obj.atributos[p.getAttribute('nome')] = true;
            } else if(p.textContent == 'false') {
                obj.atributos[p.getAttribute('nome')] = false;
            } else if(isNaN(p.textContent)) {
                obj.atributos[p.getAttribute('nome')] = p.textContent;
            } else {
                obj.atributos[p.getAttribute('nome')] = parseFloat(p.textContent);
            }
            p = p.nextSibling;
        }

        if(jFilhos) {
            var f = jFilhos.firstChild;
            obj.filhos = new Array();
            while(f) {
                obj.filhos.push(carregaObjetoXml(f));
                f = f.nextSibling;
            }
        }
        
        return obj;
    }
    
    var carregaObjetoXmlVersao2 = function ___jsde_editor_inner_carregaObjetoXmlVersao2(objXml) {
        var obj = new Object();
        var jProp = objXml.firstChild;
        var jFilhos = jProp.nextSibling;
        
        obj.classe = objXml.getAttribute('tipo');
        switch(obj.classe) {
            case 'ConexaoXML':obj.classe = 'Conexao'     ;break;
            case 'CaixaLista':obj.classe = 'ListaSelecao';break;
            default          :break;
        }
        obj.classe = 'JSDialogEdit.' + obj.classe;
        
        obj.atributos = new Object();
        if(obj.classe == 'JSDialogEdit.Janela') obj.atributos['Tipo'] = 2;
        var p = jProp.firstChild;
        while(p) {
            var atr = p.getAttribute('nome').replace(/set/, '');
            var vlr = p.textContent;
            
            switch(atr) {
                case 'Id'              :atr = 'ID';break;
                case 'Width'           :atr = 'Largura';break;
                case 'Height'          :atr = 'Altura';break;
                case 'Title'           :atr = 'Tooltip';break;
                case 'Top'             :atr = 'Superior';break;
                case 'Bottom'          :atr = 'Inferior';break;
                case 'Left'            :atr = 'Esquerda';break;
                case 'Right'           :atr = 'Direita';break;
                case 'Type'            :atr = 'Tipo';break;
                case 'Value'           :atr = 'Valor';break;
                case 'Url'             :atr = 'URL';break;
                case 'Style'           :atr = 'Estilos';break;
                case 'ClassName'       :atr = 'Classe';break;
                case 'ListaConn'       :atr = 'FonteDados';break;
                case 'ListaFieldTexto' :atr = 'CampoDados';break;
                case 'ListaFieldValor' :atr = 'ValorDados';break;
                case 'Options'         :atr = 'Opcoes';break;
                case 'Campo'           :atr = 'Referencia';break;
                case 'Conn'            :atr = 'Conector';break;
                case 'Field'           :atr = 'Campo';break;
                default :break;
            }
            
            if(obj.classe == 'JSDialogEdit.Janela' && atr == 'Tooltip') atr = 'Titulo';
            if(obj.classe == 'JSDialogEdit.Janela' && atr == 'ID' && vlr == 'mainWin') vlr = obj.atributos['Titulo'].replace(/\W/g, '');
            if(obj.classe == 'JSDialogEdit.CaixaTexto' && atr == 'Classe' && vlr.indexOf('caixatexto') == -1) vlr = 'caixatexto ' + vlr;
            if(obj.classe == 'JSDialogEdit.Rotulo' && atr == 'Estilos') {
                vlr = JSON.parse(vlr);
                if(!vlr.fontFamily) vlr.fontFamily = "Arial,Helvetica,sans-serif";
                if(!vlr.fontSize)   vlr.fontSize   = "8pt";
                if(!vlr.fontWeight) vlr.fontWeight = "bold";
                vlr = JSON.stringify(vlr);
            }
            if(obj.classe == 'JSDialogEdit.Botao' && atr == 'Estilos') {
                vlr = JSON.parse(vlr);
                if(!vlr.fontFamily) vlr.fontFamily = "Verdana,Arial,Helvetica,sans-serif";
                if(!vlr.fontSize)   vlr.fontSize   = "8pt";
                if(!vlr.fontWeight) vlr.fontWeight = "bold";
                if(!vlr.background) vlr.background = "#E5E5E5";
                if(!vlr.border) vlr.border = "1px solid #000000";
                if(!vlr.textDecoration) vlr.textDecoration = "none";
                vlr = JSON.stringify(vlr);
            }
            if(obj.classe == 'JSDialogEdit.Conexao' && atr == 'ID') obj.atributos['Metodo'] = JSDialogEdit.Conexao.TiposMetodo.GET;
            
            if(vlr.charAt(0) == '{') {
                obj.atributos[atr] = JSON.parse(vlr);
            } else if(vlr == 'true') {
                obj.atributos[atr] = true;
            } else if(vlr == 'false') {
                obj.atributos[atr] = false;
            } else if(isNaN(vlr) || vlr == ' ') {
                obj.atributos[atr] = vlr;
            } else {
                obj.atributos[atr] = parseInt(vlr, 10);
            }
            p = p.nextSibling;
        }

        if(jFilhos.childElementCount > 0) {
            var f = jFilhos.firstChild;
            obj.filhos = new Array();
            while(f) {
                obj.filhos.push(carregaObjetoXmlVersao2(f));
                f = f.nextSibling;
            }
        }
        return obj;
    }
    
    var abrirDocumentoJsonVersao2 = function ___jsde_editor_inner_abrirDocumentoJsonVersao2(estrutura, json) {
    }
    
    var abrirDocumentoJson = function ___jsde_editor_inner_abrirDocumentoJson(estrutura, json) {
        var documento, indice, lista, construtor, componente;
        
        estrutura.propriedades = json.propriedades;
        documento = new JSDialogEdit.Editor.Documento(estrutura);
        construtor = eval(json.classe);
        documento.conteudo = new construtor(json.atributos);
        documento.conteudo.setMode('edicao');
        documento.conteudo.setVisivel(true);
        
        for(var x = 0; x < json.filhos.length; x++) {
            documento.conteudo.addFilho(configComponenteOpen(json.filhos[x]));
        }
        
        if(count[JSDialogEdit.Editor.Documento.CLASSE]) {
            count[JSDialogEdit.Editor.Documento.CLASSE]++
        } else {
            count[JSDialogEdit.Editor.Documento.CLASSE] = 1;
        }
        documentos.push(documento);
        indice = documentos.length - 1;
        configDocumento(indice);
    }
    
    var configComponenteOpen = function ___jsde_editor_inner_configComponenteOpen(json) {
        var componente, construtor;
        
        construtor = eval(json.classe);
        componente = new construtor(json.atributos);
        configComponente(componente);
        if(!count[componente.CLASSE]) count[componente.CLASSE] = 0;
        count[componente.CLASSE]++;
        
        if(json.filhos) {
            for(var x = 0; x < json.filhos.length; x++) {
                componente.addFilho(configComponenteOpen(json.filhos[x]));
            }
        }
        
        return componente;
    }
    
    var salvarComo = function ___jsde_editor_inner_salvarComo() {
        if(docSelecionado === null) return;
        editandoProriedade = true;
        var janSalvar = criaCaixaDialogoAbrirSalvar('Salvar');
        var nome = documentos[docSelecionado].nome;
        if(nome.indexOf('SemTitulo') !== -1) nome = documentos[docSelecionado].conteudo.getId();
        janSalvar.getFilho('JSDESaveOpenDialog_txtNomeArquivo').setValor(nome);
    };
    
    var salvarDocumento = function ___jsde_editor_inner_salvarDocumento() {
        var dados, url, j, dialog, xml;
        
        function retornoSalvarDocumento(msg) {
            var x, lista = [];
            
            if(msg != '') {
                ultimaURLRede = null;
                documentos[docSelecionado].storageURL = null;
                documentoAlterado(true);
                documentos[docSelecionado].formato = null;
                alert(msg);
                return;
            }
            
            documentoAlterado(false);
            document.title = documentos[docSelecionado].nome + ' - ' + JSDialogEdit.version;
            
            if(window['localStorage']) {
                if(window.localStorage['ArquivosRecentes']) lista = JSON.parse(window.localStorage['ArquivosRecentes']);
                for(x = 0; x < lista.length; x++) {
                    if(lista[x].nome === documentos[docSelecionado].nome &&
                       lista[x].local === documentos[docSelecionado].storageURL &&
                       lista[x].formato === documentos[docSelecionado].formato) break;
                }
                
                if(x >= lista.length) {
                    lista.push({
                        "local":documentos[docSelecionado].storageURL,
                        "nome":documentos[docSelecionado].nome,
                        "formato":documentos[docSelecionado].formato
                    });
                    
                    window.localStorage['ArquivosRecentes'] = JSON.stringify(lista);
                }
            }
        }
        
        if(!documentos[docSelecionado].versaoAtualizada) {
            if(!documentos[docSelecionado].propriedades.numeroVersao) documentos[docSelecionado].propriedades.numeroVersao = 0;
            documentos[docSelecionado].propriedades.numeroVersao++;
            documentos[docSelecionado].versaoAtualizada = true;
        }
        documentos[docSelecionado].propriedades.dataModificacao = (new Date).getTime();
        
        if(documentos[docSelecionado].storage == 'local' && documentos[docSelecionado].formato == 'json') {
            window.localStorage[documentos[docSelecionado].nome] = JSON.stringify(documentos[docSelecionado].toObject());
        } else if(documentos[docSelecionado].storage == 'local' && documentos[docSelecionado].formato == 'xml') {
            dialog = documentos[docSelecionado].toXml();
            xml = JSDialogEdit.XML.newDocument();
            xml.appendChild(dialog);
            dados = '<?xml version="1.0" encoding="UTF-8"?>' + JSDialogEdit.XML.xml2String(xml);
            window.localStorage[documentos[docSelecionado].nome] = dados;
        } else if(documentos[docSelecionado].storage == 'rede' && documentos[docSelecionado].formato == 'json') {
            dados = {
                        "nome" : documentos[docSelecionado].nome,
                        "formato" : "json",
                        "conteudo" : encodeURIComponent(JSON.stringify(documentos[docSelecionado].toObject()))
                    };
            url = documentos[docSelecionado].storageURL;
            j = new JSDialogEdit.Ajax();
            j.postDados({
                'url' : url,
                'dados' : dados,
                'metodo' : retornoSalvarDocumento,
                'erro' : function(msg, erro) {alert("Houve um erro " + erro + " ao acessar o endereco " + url + "\n" + msg)}
            });
        } else if(documentos[docSelecionado].storage == 'rede' && documentos[docSelecionado].formato == 'xml') {
            dialog = documentos[docSelecionado].toXml();
            xml = JSDialogEdit.XML.newDocument();
            xml.appendChild(dialog);
            dados = {
                "nome" : documentos[docSelecionado].nome,
                "formato" : "xml",
                "conteudo" : encodeURIComponent('<?xml version="1.0" encoding="UTF-8"?>' + JSDialogEdit.XML.xml2String(xml))
            };
            url = documentos[docSelecionado].storageURL;
            j = new JSDialogEdit.Ajax();
            j.postDados({
                'url' : url,
                'dados' : dados,
                'metodo' : retornoSalvarDocumento,
                'erro' : function(msg, erro) {alert("Houve um erro " + erro + " ao acessar o endereco " + url + "\n" + msg)}
            });
        } else {
            alert("Erro interno, nao foi possivel salvar o documento:\n" + documentos[docSelecionado].storage + "\n" + documentos[docSelecionado].formato);
            return;
        }
    }

    var handlerTeclado = function ___jsde_editor_inner_handlerTeclado(e) {
        // referencias para Key Code
        // http://asquare.net/javascript/tests/KeyCode.html
        // http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
        e = e ? e : event;
        var deslocamento = GRADE;
        var key = e.keyCode;
        var kchar = JSDialogEdit.Core.getBrowser().indexOf('gecko') != -1 ? String.fromCharCode(e.charCode).toUpperCase() : String.fromCharCode(e.keyCode).toUpperCase();
        var _target = e.target ? e.target : e.srcElement;
        
        if(editandoProriedade) {
            if(key == 27) { // ESC
                carregarPropriedades();
                if(estilo) fimAplicarEstilo();
                editandoProriedade = false;
            }
            return true;
        }
        
        switch(key) {
            case 46: // DEL
                removeComponente();
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
                return false;
            case 9: // TAB
                if(e.ctrlKey) return true;
                if(e.shiftKey) {
                    componenteAnterior();
                } else {
                    componenteSeguinte(1);
                }
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
                return false;
            case 37: // ESQUERDA
            case 38: // CIMA
            case 39: // DIREITA
            case 40: // BAIXO
                if(e.ctrlKey) deslocamento *= 2;
                if(e.shiftKey) deslocamento = 1;
                
                if(e.altKey) {
                    redimencionaComponente(key, deslocamento);
                } else {
                    reposicionaComponente(key, deslocamento);
                }
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
                return false;
            default:
                break;
        }
        
        if(e.ctrlKey) {
            switch(kchar) {
                case 'C':
                    copiar();
                    e.cancelBubble = true;
                    if (e.stopPropagation) e.stopPropagation();
                    return false;
                case 'G':
                    alinharGrade();
                    e.cancelBubble = true;
                    if (e.stopPropagation) e.stopPropagation();
                    return false;
                case 'N':
                    e.cancelBubble = true;
                    if (e.stopPropagation) e.stopPropagation();
                    novoDocumento(e);
                    return false;
                case 'O':
                    abrir();
                    e.cancelBubble = true;
                    if (e.stopPropagation) e.stopPropagation();
                    return false;
                case 'S':
                    salvar();
                    e.cancelBubble = true;
                    if (e.stopPropagation) e.stopPropagation();
                    return false;
                case 'T':
                    if(docSelecionado != null) testarCodigo();
                    e.cancelBubble = true;
                    if (e.stopPropagation) e.stopPropagation();
                    if (e.preventDefault) e.preventDefault();
                    return false;
                case 'V':
                    colar(e);
                    e.cancelBubble = true;
                    if (e.stopPropagation) e.stopPropagation();
                    return false;
                case 'X':
                    recortar();
                    e.cancelBubble = true;
                    if (e.stopPropagation) e.stopPropagation();
                    return false;
                case 'Y':
                    refazerAcao();
                    e.cancelBubble = true;
                    if (e.stopPropagation) e.stopPropagation();
                    return false;
                case 'Z':
                    desfazerAcao();
                    e.cancelBubble = true;
                    if (e.stopPropagation) e.stopPropagation();
                    return false;
                default:
                    return true;
            }
        }
        
        if(e.altKey) {
            switch(key) {
                case 13: // ENTER
                    if(objSelecionado != null) {
                        janPropriedades.setVisivel(true);
                        if(divEvt.style.display == 'none') {
                            document.getElementById('prop_ID').focus();
                        } else {
                            divEvt.firstChild.firstChild.firstChild.childNodes[1].childNodes[0].focus();
                        }
                    }
                    return false;
                default:
                    break;
            }
            
            switch(kchar) {
                case 'P':
                    ativaAbaPropriedade('propriedades');
                    return false;
                case 'E':
                    ativaAbaPropriedade('eventos');
                    return false;
                default:
                    return true;;
            }
        }
        
        if(docSelecionado != null) {
            switch(kchar) {
                case 'A':
                    novo = JSDialogEdit.PainelAbas;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'B':
                    novo = JSDialogEdit.Botao;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'C':
                    novo = JSDialogEdit.CaixaSelecao;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'D':
                    novo = JSDialogEdit.CampoData;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'E':
                    novo = JSDialogEdit.TreeView;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'F':
                    novo = JSDialogEdit.Frame;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'G':
                    novo = JSDialogEdit.CaixaGrupo;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'H':
                    novo = JSDialogEdit.Senha;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'I':
                    novo = JSDialogEdit.Imagem;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'J':
                    novo = JSDialogEdit.Ajax;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'L':
                    novo = JSDialogEdit.Rotulo;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'M':
                    novo = JSDialogEdit.Memorando;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'N':
                    novo = JSDialogEdit.Tabela;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'O':
                    novo = JSDialogEdit.CampoOculto;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'P':
                    novo = JSDialogEdit.Painel;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'R':
                    novo = JSDialogEdit.GrupoBotaoRadio;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'S':
                    novo = JSDialogEdit.ListaSelecao;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'T':
                    novo = JSDialogEdit.CaixaTexto;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'U':
                    novo = JSDialogEdit.MenuConteiner;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'X':
                    novo = JSDialogEdit.Conexao;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                case 'Z':
                    novo = JSDialogEdit.Temporizador;
                    adicionaComponente.call(documentos[docSelecionado].conteudo, e);
                    return false;
                default:
                    break;
            }
        }
        
        return true;
    };
    
    var selecionaObjeto = function ___jsde_editor_inner_selecionaObjeto(c) {
        if(c === undefined) {
            objSelecionado = null;
            janPropriedades.setTitulo('Propriedades');
            divProp.innerHTML = '';
            divEvt.innerHTML = '';
        } else if(estilo) {
            trocaAbaSelecao(c);
            aplicarEstilo(c);
        } else {
            objSelecionado = c;
            var id = objSelecionado.getId();
            janPropriedades.setTitulo((___JSDEIDIOMA['Propriedades'] || 'Propriedades') + ':' + objSelecionado.getId() + '['+objSelecionado.CLASSE+']');
            carregarPropriedades();
            arvoreComponentes.setValor(id);
            
            if(!document.getElementById(c.getId()) ||
               (objSelecionado.getLayout && objSelecionado.getLayout() !== JSDialogEdit.Conteiner.TiposLayout.NONE)) {
                divSelecao.style.display = 'none';
            } else {
                trocaAbaSelecao(objSelecionado);
                var conteiner = objSelecionado.getElementoDesign().parentNode;
                conteiner.insertBefore(divSelecao, conteiner.firstChild);
                atualizaSelecao();
            }
        }
		
		if(c === undefined || c instanceof JSDialogEdit.Janela) {
			barraFerramentas.btnCopiar.setDesabilitado(true);
			barraFerramentas.btnRecortar.setDesabilitado(true);
			barraFerramentas.btnAplicarEstilo.setDesabilitado(true);
		} else {
			barraFerramentas.btnCopiar.setDesabilitado(false);
			barraFerramentas.btnRecortar.setDesabilitado(false);
			barraFerramentas.btnAplicarEstilo.setDesabilitado(false);
		}
    }
    
    var atualizaSelecao = function ___jsde_editor_inner_atualizaSelecao() {
        if(objSelecionado instanceof JSDialogEdit.Componente) {
            if (
                  objSelecionado instanceof JSDialogEdit.Janela ||
                  (objSelecionado.getLayout && objSelecionado.getLayout() !== JSDialogEdit.Conteiner.TiposLayout.NONE)
               ) {
                divSelecao.style.display = 'none';
            } else {
                divSelecao.style.display = 'block';
            }
            
            divSelecao.style.minWidth  = (objSelecionado.larguraMin || 16) + 'px';
            divSelecao.style.minHeight = (objSelecionado.alturaMin  || 16) + 'px';
            divSelecao.style.top       = objSelecionado.getSuperior() + 'px';
            divSelecao.style.left      = objSelecionado.getEsquerda() + 'px';
            divSelecao.style.width     = (objSelecionado.getLargura()+5) + 'px';
            divSelecao.style.height    = (objSelecionado.getAltura()+5) + 'px';
        } else {
            if(!document.getElementById(objSelecionado.getId())) return;
            var target = objSelecionado.getElementoDesign();
            divSelecao.style.display = 'block';
            divSelecao.style.minWidth  = '1px';
            divSelecao.style.minHeight = '1px';
            divSelecao.style.top    = target.offsetTop + 'px';
            divSelecao.style.left   = target.offsetLeft + 'px';
            divSelecao.style.width  = target.getBoundingClientRect().width  + 'px';
            divSelecao.style.height = target.getBoundingClientRect().height + 'px';
        }
        
        atualizaDivEstilo();
    }

    var trocaAbaSelecao = function ___jsde_editor_inner_trocaAbaSelecao(obj) {
        var conteiner;
        
        if(obj === documentos[docSelecionado].conteudo || obj instanceof JSDialogEdit.GerenciadorJanela) {
            return;
        } else if(obj.getConteiner() instanceof JSDialogEdit.PainelAbas.Aba) {
            conteiner = obj.getConteiner();
            conteiner.getConteiner().setAbaAtiva(conteiner);
        } else {
            trocaAbaSelecao(obj.getConteiner());
        }
    }
    
    var carregarPropriedades = function ___jsde_editor_inner_carregarPropriedades(selecao) {
        var prop, tbl, tbd;
        
        if(divProp.firstChild) divProp.removeChild(divProp.firstChild);
        if(divEvt.firstChild) divEvt.removeChild(divEvt.firstChild);

        // *** CARREGANDO PROPRIEDADES *** ///
        if(!(objSelecionado instanceof JSDialogEdit.Objeto)) return;
        
        prop = objSelecionado.getPropriedades();
        tbl = document.createElement('table');
        tbd = document.createElement('tbody');
        tbl.style.width = '100%';
        tbl.style.position = 'relative';
        tbl.appendChild(tbd);

        for (var i = 0; i < prop.length; i++) {
            if(!prop[i].habilitado) continue;
            
            var linha = document.createElement('tr'),
                label = document.createElement('td'),
                lbl = document.createElement('div'),
                valor = document.createElement('td'),
                campo = null,
                expandir = null;

            lbl.style.width = '65px';
            lbl.style.whiteSpace = 'nowrap';
            lbl.innerHTML = prop[i].nome;
            label.appendChild(lbl);
            label.style.verticalAlign = 'top';
            linha.title = ___JSDEIDIOMA[prop[i].descricao] || prop[i].descricao;
            
            switch(prop[i].tipo) {
                case JSDialogEdit.Propriedade.Tipos.Valor:
                    campo = document.createElement('input');
                    campo.type = 'text';
                    campo.id = 'prop_' + prop[i].nome;
                    campo.value = objSelecionado[prop[i].get]();
                    campo.style.width = '100%';
                    campo.disabled = prop[i].readonly === true ? true : false;
                    campo.onchange = alteraPropriedade;
                    JSDialogEdit.Core.capturaEvento(campo, 'focus', function() {
                        var id = 'divEditorEvento_' + this.id.split('_')[1] + '_' + objSelecionado.getId();
                        var edt = document.getElementById(id);
                        if(edt) document.body.removeChild(edt);
                    });
                    
                    expandir = document.createElement('input');
                    expandir.type = 'button';
                    expandir.id = 'propExpandir_' + prop[i].nome;
                    expandir.value = '...';
                    expandir.title = 'Editar valor';
                    expandir.className = 'btnExpandirValor';
                    expandir.tabIndex = '-1';
                    expandir.onclick = carregaEditorEvento;
                    expandir.onfocus = function() {editandoProriedade = true};
                    expandir.onblur = function() {editandoProriedade = false};
                    
                    if (!prop[i].readonly) {valor.appendChild(expandir);};
                    valor.appendChild(campo);
                    break;
                case JSDialogEdit.Propriedade.Tipos.Numero:
                    campo = document.createElement('input');
                    campo.type = 'number';
                    campo.id = 'prop_' + prop[i].nome;
                    campo.value = objSelecionado[prop[i].get]();
                    campo.style.width = '100%';
                    campo.style.textAlign = 'right';
                    campo.disabled = prop[i].readonly === true ? true : false;
                    campo.onchange = alteraPropriedade;
                    valor.appendChild(campo);
                    break;
                case JSDialogEdit.Propriedade.Tipos.Boolean:
                    campo = document.createElement('input');
                    campo.type = 'checkbox'
                    campo.id = 'prop_' + prop[i].nome;
                    campo.checked = objSelecionado[prop[i].get]();
                    campo.disabled = prop[i].readonly === true ? true : false;
                    campo.onclick = alteraPropriedade;
                    valor.appendChild(campo);
                    break;
                case JSDialogEdit.Propriedade.Tipos.Lista:
                    campo = document.createElement('select');
                    campo.id = 'prop_' + prop[i].nome;
                    campo.style.width = '100%';
                    campo.value = objSelecionado[prop[i].get]();
                    campo.disabled = prop[i].readonly === true ? true : false;
                    campo.onchange = alteraPropriedade;
                    
                    var x = 0;
                    for(var lst in prop[i].opcoes) {
                        if(lst == 'toJSONString') continue;
                        // (nome, valor)
                        campo.options[x] = new Option(lst, prop[i].opcoes[lst]);
                        if(objSelecionado[prop[i].get]() == prop[i].opcoes[lst]) {
                            campo.selectedIndex = x;
                            campo.options[x].selected = true;
                        }
                        x++;
                    }
                    
                    valor.appendChild(campo);
                    break;
                case JSDialogEdit.Propriedade.Tipos.ListaFuncao:
                    var lst = objSelecionado[prop[i].funcao]();
                    var x = 0;
                    
                    campo = document.createElement('select');
                    campo.id = 'prop_' + prop[i].nome;
                    campo.style.width = '100%';
                    campo.value = objSelecionado[prop[i].get]();
                    campo.disabled = prop[i].readonly === true ? true : false;
                    campo.onchange = alteraPropriedade;
                    
                    for(var item in lst) {
                        if(lst == 'toJSONString') continue;
                        // (nome, valor)
                        campo.options[x] = new Option(item, lst[item]);
                        if(objSelecionado[prop[i].get]() == lst[item]) campo.selectedIndex = x;
                        x++;
                    }
                    
                    if(campo.options.length === 0) {
                        var tmpopt = objSelecionado[prop[i].get]();
                        campo.options[0] = new Option(tmpopt, tmpopt);
                    }
                    
                    valor.appendChild(campo);
                    break;
                case JSDialogEdit.Propriedade.Tipos.Objeto:
                    campo = document.createElement('input');
                    campo.type = 'button';
                    campo.id = 'prop_' + prop[i].nome;
                    campo.value = '...';
                    campo.disabled = prop[i].readonly === true ? true : false;
                    campo.onclick = function() {
                        var p = objSelecionado.getPropriedade(this.id.split('_')[1]);
                        this.blur();
                        editandoProriedade = true;
                        carregaEditorObjeto(p, this.parentNode);
                    };
                    valor.appendChild(campo);
                    break;
                case JSDialogEdit.Propriedade.Tipos.Editor:
                    campo = document.createElement('input');
                    campo.type = 'button';
                    campo.id = 'prop_' + prop[i].nome;
                    campo.value = '...';
                    campo.disabled = prop[i].readonly === true ? true : false;
                    campo.onclick = carregaEditorEvento;
                    valor.appendChild(campo);
                    break;
                case JSDialogEdit.Propriedade.Tipos.Acao:
                    campo = document.createElement('input');
                    campo.type = 'button';
                    campo.id = 'prop_' + prop[i].nome;
                    campo.value = '...';
                    campo.disabled = prop[i].readonly === true ? true : false;
                    campo.onclick = alteraPropriedade;
                    valor.appendChild(campo);
                    break;
                default:
                    valor.innerHTML = objSelecionado[prop[i].get]();
                    break;
            }

            if(campo != null) {
                campo.onfocus = function(){editandoProriedade = true};
                campo.onblur = function(){editandoProriedade = false};
                if(prop[i].nome === selecao) selecao = campo;
            }
            label.style.borderBottom = '1px solid #E6E6E6';
            valor.style.borderBottom = '1px solid #E6E6E6';
            linha.appendChild(label);
            linha.appendChild(valor);
            tbd.appendChild(linha);
        }

        divProp.appendChild(tbl);
        
        // *** CARREGANDO EVENTOS *** ///
        prop = objSelecionado.getEventos();
        tbl = document.createElement('table');
        tbd = document.createElement('tbody');
        tbl.appendChild(tbd);
        tbl.style.width = '100%';

        for (var i = 0; i < prop.length; i++) {
            if(!prop[i].habilitado) continue;
            
            var linha = document.createElement('tr');
            var label = document.createElement('td');
            var valor = document.createElement('td');
            var campo = null;
            
            label.innerHTML = prop[i].nome;
            
            campo = document.createElement('input');
            campo.type = 'button';
            campo.id = 'evt_' + prop[i].nome;
            campo.value = '...';
            campo.onfocus = function(){editandoProriedade = true};
            campo.onblur = function(){editandoProriedade = false};
            campo.onclick = carregaEditorEvento;

            valor.appendChild(campo);
            
            label.style.borderBottom = '1px solid #E6E6E6';
            valor.style.borderBottom = '1px solid #E6E6E6';
            linha.title = ___JSDEIDIOMA[prop[i].descricao] || prop[i].descricao;
            linha.appendChild(label);
            linha.appendChild(valor);
            linha.style.borderBottom = '1px solid #E6E6E6';
            tbd.appendChild(linha);
        }

        divEvt.appendChild(tbl);
        
        if(selecao && selecao.focus) selecao.focus();
    }
    
    var carregaEditorObjeto = function ___jsde_editor_inner_carregaEditorObjeto(prop) {
        var obj = objSelecionado[prop.get]();
        var div, divBtns, btnMais, btnMenos, btnOk, btnCancela, btnSobe, btnDesce, tbl, tbd, janela;
        
        divBtns = document.createElement('div');
        divBtns.style.textAlign = 'center';
        divBtns.style.backgroundColor = '#E6E6E6';
        divBtns.style.padding = '3px 0px';
        
        btnMais = document.createElement('input');
        btnMais.type = 'image';
        btnMais.id = 'janProp_' + prop.nome + '_btnMais';
        btnMais.title = 'Adiciona um item na colecao';
        btnMais.value = '+';
        btnMais.src = JSDialogEdit.pastaImagens+'icon_add.png';
        btnMais.style.border = 'none';
        btnMais.style.padding = '0px 5px';
        btnMais.onfocus = function(){editandoProriedade = true};
        btnMais.onclick = function(e) {
            e = e ? e : event;
            var linha = criaLinhaEditorObjeto('', '', prop.nome);
            tbd.appendChild(linha);
            linha.childNodes[1].firstChild.focus();
            return false;
        }
        divBtns.appendChild(btnMais);
        
        btnMenos = document.createElement('input');
        btnMenos.type = 'image';
        btnMenos.id = 'janProp_' + prop.nome + '_btnMenos';
        btnMenos.title = 'Remove os itens selecionados da colecao';
        btnMenos.value = '-';
        btnMenos.src = JSDialogEdit.pastaImagens+'icon_delete.png';
        btnMenos.style.border = 'none';
        btnMenos.style.padding = '0px 5px';
        btnMenos.onfocus = function(){editandoProriedade = true};
        btnMenos.onclick = function() {
            for(var i = 0; i < tbd.rows.length; i++) {
                if(tbd.rows[i].childNodes[0].firstChild.checked) {
                    tbd.deleteRow(i);
                    i = i == 0 ? -1 : i - 2;
                }
            }
            return false;
        }
        divBtns.appendChild(btnMenos);
        
        btnOk = document.createElement('input');
        btnOk.type = 'image';
        btnOk.id = 'janProp_' + prop.nome + '_btnOk';
        btnOk.title = 'Confirma e aplica as alteracoes nos itens';
        btnOk.value = '\u221A';
        btnOk.src = JSDialogEdit.pastaImagens+'icon_accept.png';
        btnOk.style.border = 'none';
        btnOk.style.padding = '0px 5px';
        btnOk.onfocus = function(){editandoProriedade = true};
        btnOk.onclick = function (e) {
            e = e || event;
            alteraPropriedade.call(this, e);
            janela.fechar();
            return false;
        }
        divBtns.appendChild(btnOk);
        
        btnCancela = document.createElement('input');
        btnCancela.type = 'image';
        btnCancela.id = 'janProp_' + prop.nome + '_btnCancela';
        btnCancela.title = 'Cancela e desfaz todas as alteracoes';
        btnCancela.value = 'x';
        btnCancela.src = JSDialogEdit.pastaImagens+'icon_cancelar.png';
        btnCancela.style.border = 'none';
        btnCancela.style.padding = '0px 5px';
        btnCancela.onfocus = function(){editandoProriedade = true};
        btnCancela.onclick = function() {
            janela.fechar();
            return false;
        }
        divBtns.appendChild(btnCancela);
        
        btnSobe = document.createElement('input');
        btnSobe.type = 'image';
        btnSobe.id = 'janProp_' + prop.nome + '_btnSobe';
        btnSobe.title = 'Sobe';
        btnSobe.value = 'A';
        btnSobe.src = JSDialogEdit.pastaImagens+'icon_up.png';
        btnSobe.style.border = 'none';
        btnSobe.style.padding = '0px 5px';
        btnSobe.onfocus = function(){editandoProriedade = true};
        btnSobe.onclick = function(){
            var i, linhaAcima, selecao = [];

            for(i = 0; i < tbl.rows.length; i++) if(tbl.rows[i].childNodes[0].firstChild.checked) selecao.push(i);
            
            for(i = 0; i < selecao.length; i++) {
                if(selecao[i] == 0) continue;
                if(i > 0 && selecao[i-1] == selecao[i] - 1) continue;
                linhaAcima = tbl.rows[selecao[i]].previousElementSibling || tbl.rows[selecao[i]].previousSibling;
                linhaAcima.parentNode.insertBefore(tbl.rows[selecao[i]], linhaAcima);
                selecao[i]--;
            }
            return false;
        };
        divBtns.appendChild(btnSobe);

        btnDesce = document.createElement('input');
        btnDesce.type = 'image';
        btnDesce.id = 'janProp_' + prop.nome + '_btnDesce';
        btnDesce.title = 'Desce';
        btnDesce.value = 'V';
        btnDesce.src = JSDialogEdit.pastaImagens+'icon_down.png';
        btnDesce.style.border = 'none';
        btnDesce.style.padding = '0px 5px';
        btnDesce.onfocus = function(){editandoProriedade = true};
        btnDesce.onclick = function(){
            var i, linhaAbaixo, tmp, selecao = [];
            
            for(i = tbl.rows.length - 1; i >= 0; i--) if(tbl.rows[i].childNodes[0].firstChild.checked) selecao.push(i);
            
            for(i = 0; i < selecao.length; i++) {
                if(selecao[i] == tbl.rows.length - 1) continue;
                if(i > 0 && selecao[i-1] == selecao[i] + 1) continue;
                linhaAbaixo = tbl.rows[selecao[i]].nextElementSibling || tbl.rows[selecao[i]].nextSibling;
                tmp = tbl.insertRow(linhaAbaixo.rowIndex + 1);
                linhaAbaixo.parentNode.insertBefore(tbl.rows[selecao[i]], tmp);
                linhaAbaixo.parentNode.removeChild(tmp);
                selecao[i]++;
            }
            return false;
        };
        divBtns.appendChild(btnDesce);
        
        tbd = document.createElement('tbody');
        for(var item in obj) {
            if(item == 'toJSONString') continue;
            var linha = criaLinhaEditorObjeto(item, obj[item], prop.nome);
            tbd.appendChild(linha);
        }
        
        tbl = document.createElement('table');
        tbl.cellSpacing = '0px';
        tbl.cellPadding = '5px';
		tbl.style.width = '100%';
        tbl.appendChild(tbd);
        
        div = document.createElement('div');
        // div.style.overflow = 'auto';
        // div.style.height = '250px';
        div.appendChild(tbl);
        
        janela = new JSDialogEdit.Janela({
            'ID' : 'janProp_' + objSelecionado.getId() + '_' + prop.nome,
            'Tipo' : JSDialogEdit.Janela.TiposJanela.MODAL,
            'Titulo' : objSelecionado.getId() + "." + prop.nome,
            'Largura' : 400,
            'AcaoFechar' : 1,
            'Exibicao' : JSDialogEdit.Janela.TiposExibicao.VERTICAL,
            'Icone' : 'imagens/icon_documento.gif'
        });
        janela.setRedimensionavel(true);
		janela.setOnCloseFunction(function () {editandoProriedade = false;});
        janela.appendHTMLChild(divBtns);
        janela.appendHTMLChild(div);
        
        btnMais.focus();
    }
    
    var criaLinhaEditorObjeto = function ___jsde_editor_inner_criaLinhaEditorObjeto(nome, valor, id) {
        var tr = document.createElement('tr'),
            tdChk = document.createElement('td'),
            tdNome = document.createElement('td'),
            tdValor = document.createElement('td'),
            chk = document.createElement('input'),
            txtNome = document.createElement('input'),
            txtValor = document.createElement('input');
        
        chk.type = 'checkbox';
        chk.title = 'Marque as propriedades que deseja excluir';
        chk.id = 'janProp_' + id + '_' + nome + '_chk';
        // chk.onfocus = function(){editandoProriedade = true};
        
        txtNome.type = 'text';
        txtNome.title = 'Nome da propriedade';
        txtNome.value = nome;
        if(nome == '') nome = (new Date()).getTime();
        txtNome.id = 'janProp_' + id + '_' + nome + '_txtNome';
        txtNome.style.width = '100%';
        // txtNome.onfocus = function () {editandoProriedade = true;};
        
        txtValor.type = 'text';
        txtValor.title = 'Valor da propriedade';
        txtValor.value = valor;
        if(valor == '') valor = (new Date()).getTime();
        txtValor.id = 'janProp_' + id + '_' + nome + '_txtValor';
        txtValor.style.width = '100%';
        // txtValor.onfocus = function(){editandoProriedade = true};
        
        tdChk.appendChild(chk);
        tdNome.appendChild(txtNome);
        tdValor.appendChild(txtValor);
        tr.appendChild(tdChk);
        tr.appendChild(tdNome);
        tr.appendChild(tdValor);
        
        return tr;
    }
    
    var carregaEditorEvento = function ___jsde_editor_inner_carregaEditorEvento(e) {
        e = e || event;
        
        var janela, btnConfirmar, btnCancelar, barraFerramentas, editor, aceEditor, funcao,
            ref = objSelecionado,
            idSelecao = objSelecionado.getId(),
            evento = this.id.split('_')[1],
            janId = 'janEditorEvento_' + evento + '_' + idSelecao,
            prop = objSelecionado.getEvento(evento) || objSelecionado.getPropriedade(evento),
            editandoEvento = prop.tipo === JSDialogEdit.Propriedade.Tipos.Funcao,
            src = objSelecionado[prop.get](),
            tituloEditor = (prop.retorno != undefined ? prop.retorno + ' ' : '') +
                           idSelecao + '.' + evento +
                           (prop.parametros != undefined ? '(' + prop.parametros + ')' : '');
        
        janela = window.JSDEGerenciadorJanela.getFilho(janId);
        if(janela) {
            janela.setAtiva(true);
            return;
        }
        
        funcao = function (e) {
            editor.style.width = (janela.getLargura() - 2) + 'px';
            editor.style.height = (janela.getAltura() - 47) + 'px';
            
            if(prop.tipo === JSDialogEdit.Propriedade.Tipos.Funcao) {
                aceEditor.resize(true);
                aceEditor.focus();
            } else {
                editor.focus();
            }
        };
        
        janela = new JSDialogEdit.Janela({
            'ID' : janId,
            'Largura' : 640,
            'Altura' : 480,
            'Tipo' : JSDialogEdit.Janela.TiposJanela.NORMAL,
            'Titulo' : tituloEditor,
            'AcaoFechar' : JSDialogEdit.Janela.AoFechar.DESTROY,
            'Exibicao' : JSDialogEdit.Janela.TiposExibicao.HIDDEN
        });
        janela.setOnFocusFunction(function (e) {
            selecionaObjeto(ref);
            editandoProriedade = true;
            
            if(editandoEvento) {
                aceEditor.focus();
            } else {
                editor.focus();
            }
            
            return true;
        });
        janela.setOnBlurFunction(function (e) {
            editandoProriedade = false;
            return true;
        });
        janela.setOnStateChangedFunction(funcao);
        janela.onResize = funcao;
        
        btnConfirmar = new JSDialogEdit.Botao({
            'ID' : 'btnConfirmar_' + evento + '_' + idSelecao,
            'Tooltip' : '',
            'Valor' : ___JSDEIDIOMA['Confirmar'],
            'Classe' : 'jsde_BotaoConfirmar'
        });
        btnConfirmar.setOnClickFunction(function (e) {
            e = e ? e : event;
            if(editandoEvento) {
                editor.value = aceEditor.getValue();
                aceEditor.destroy();
            }
            alteraPropriedade.call(editor, e);
            editor.blur();
            janela.fechar();
            editandoProriedade = false;
        });
        
        btnCancelar = new JSDialogEdit.Botao({
            'ID' : 'btnCancelar_' + evento + '_' + idSelecao,
            'Tooltip' : '',
            'Valor' : ___JSDEIDIOMA['Cancelar'],
            'Classe' : 'jsde_BotaoCancelar'
        });
        btnCancelar.setOnClickFunction(function () {
            janela.fechar();
            editandoProriedade = false;
        });
        
        barraFerramentas = new JSDialogEdit.Painel({
            'ID' : 'pnlEditorEvento_' + evento + '_' + idSelecao,
            'Estilos' : {
                'border' : 'none',
                'backgroundColor' : '#E6E6E6',
                'padding' : '1px',
                'textAlign' : 'center'
            },
            'Layout' : 'superior',
            'Altura' : 26
        });
        barraFerramentas.addFilho(btnConfirmar);
        barraFerramentas.addFilho(btnCancelar);
        
        if(editandoEvento) {
            editor = document.createElement('pre');
            editor.innerHTML = src;
            janela.setIcone('imagens/icon_evento.png');
        } else {
            editor = document.createElement('textarea');
            editor.value = src;
            editor.style.resize = 'none';
            janela.setIcone('imagens/icon_documento.gif');
            janela.setLargura(400);
            janela.setAltura(230);
            janela.centralizar();
        }
        
        editor.id = 'editorEvento_' + evento + '_' + idSelecao;
        editor.style.MozBoxSizing = 'border-box';
        editor.style.WebkitBoxSizing = 'border-box';
        editor.style.boxSizing = 'border-box';
        editor.style.margin = '0px';
        editor.style.width = (janela.getLargura() - 2) + 'px';
        editor.style.height = (janela.getAltura() - 47) + 'px';
        editor.onfocus = function () {editandoProriedade = true;};
        editor.onblur = function () {editandoProriedade = false;};
        editor.onkeypress = function (e) {if((e || event).keyCode == 27) janela.fechar();};
        janela.addFilho(barraFerramentas);
        janela.appendHTMLChild(editor);
        
        if(editandoEvento) {
            aceEditor = ace.edit(editor.id);
            aceEditor.getSession().setMode("ace/mode/javascript");
            aceEditor.setOptions({
                enableBasicAutocompletion: true
            });
            var langTools = ace.require("ace/ext/language_tools");
            // langTools.addCompleter(editorCodigoAutocompletar);
            
            aceEditor.on("focus", function () {
                editandoProriedade = true;
            });
            aceEditor.on("blur", function () {
                editandoProriedade = false;
            });
            
            /*
            // uses http://rhymebrain.com/api.html
            var rhymeCompleter = {
                getCompletions: function(editor, session, pos, prefix, callback) {
                    if (prefix.length === 0) { callback(null, []); return }
                    $.getJSON(
                        "http://rhymebrain.com/talk?function=getRhymes&word=" + prefix,
                        function(wordList) {
                            // wordList like [{"word":"flow","freq":24,"score":300,"flags":"bc","syllables":"1"}]
                            callback(null, wordList.map(function(ea) {
                                return {name: ea.word, value: ea.word, score: ea.score, meta: "rhyme"}
                            }));
                        })
                }
            }
            */
            
            aceEditor.focus();
        } else {
            editor.focus();
        }
        
        editandoProriedade = true;
    };
    
    /* var ___carregaEditorEvento = function (e) {
        e = e ? e : event;
        
        var divEditorEvento, editorEvento, aceEditor,
            ref = objSelecionado,
            idSelecao = objSelecionado.getId(),
            evento = this.id.split('_')[1],
            prop = objSelecionado.getEvento(evento) || objSelecionado.getPropriedade(evento),
            src = objSelecionado[prop.get](),
            tituloEditor = (prop.retorno != undefined ? prop.retorno + ' ' : '') +
                           idSelecao + '.' + evento +
                           (prop.parametros != undefined ? '(' + prop.parametros + ')' : ''),
            px = parseInt((document.documentElement.clientWidth - 640)/2, 10),
            py = parseInt((document.documentElement.clientHeight - 480)/2, 10);
            if(py < 64) py = 64;
        
        divEditorEvento = document.getElementById('divEditorEvento_' + evento + '_' + idSelecao);
        if(divEditorEvento) {
            divEditorEvento.style.zIndex = parseInt(divEditorEvento.style.zIndex, 10) + 1;
            document.getElementById('editorEvento_' + evento + '_' + idSelecao).focus();
            return;
        }

        divEditorEvento = document.createElement('div');
        divEditorEvento.id = 'divEditorEvento_'+evento + '_' + idSelecao;
        divEditorEvento.className = 'editor_evento jsdeResize';
        divEditorEvento.style.left = px + 'px';
        divEditorEvento.style.top = py + 'px';
        divEditorEvento.style.width = '640px';
        divEditorEvento.style.height = '480px';
        divEditorEvento.style.zIndex = '1001';
        divEditorEvento.style.minWidth = '150px';
        divEditorEvento.style.minHeight = '52px';
        JSDialogEdit.Core.capturaEvento(divEditorEvento, 'mousedown', function(e) {
            e = e || event;
            var _target = e.target || e.srcElement;
            divEditorEvento.style.zIndex = '1001';
            selecionaObjeto(ref);
            if(_target === divEditorEvento) {
                JSDialogEdit.resizeComp = divEditorEvento;
            }
        });
        JSDialogEdit.Core.capturaEvento(divEditorEvento, 'mouseup', function() {
            if(prop.tipo !== JSDialogEdit.Propriedade.Tipos.Funcao) {
                editorEvento.style.width = (parseInt(divEditorEvento.style.width , 10) - 8) + 'px';
                editorEvento.style.height = (parseInt(divEditorEvento.style.height, 10) - 34) + 'px';
                editorEvento.focus();
            } else {
                aceEditor.resize(true);
                aceEditor.focus();
            }
        });
        JSDialogEdit.Core.capturaEvento(divEditorEvento, 'click', function(e) {
            editorEvento.focus();
            if(prop.tipo === JSDialogEdit.Propriedade.Tipos.Funcao) {
                aceEditor.focus();
            }
            e = e ? e : event;
            e.cancelBubble = true;
        });
        
        var barraEditorEvento = document.createElement('div');
        barraEditorEvento.style.width = '100%';
        barraEditorEvento.style.height = '22px';
        JSDialogEdit.Core.disableSelection(barraEditorEvento);
        JSDialogEdit.Core.capturaEvento(barraEditorEvento, 'mousedown', function() {
            JSDialogEdit.dragComp = divEditorEvento;
        });
        
        var btnConfirmaEvento = document.createElement('img');
        btnConfirmaEvento.id = 'btnConfirmaEvento_' + evento + '_' + idSelecao;
        btnConfirmaEvento.src = JSDialogEdit.pastaImagens+'icon_accept.png';
        btnConfirmaEvento.alt = '';
        btnConfirmaEvento.title = 'Confirma alteracao do codigo';
        btnConfirmaEvento.style.cursor = 'pointer';
        btnConfirmaEvento.onclick = function(e) {
            e = e ? e : event;
            if(prop.tipo === JSDialogEdit.Propriedade.Tipos.Funcao) {
                editorEvento.value = aceEditor.getValue();
                aceEditor.destroy();
            }
            alteraPropriedade.call(editorEvento, e);
            editorEvento.blur();
            document.body.removeChild(divEditorEvento);
            editandoProriedade = false;
        }
        
        var btnCancelaEvento = document.createElement('img');
        btnCancelaEvento.id = 'btnCancelaEvento_' + evento + '_' + idSelecao;
        btnCancelaEvento.src = JSDialogEdit.pastaImagens+'icon_cancelar.png';
        btnCancelaEvento.alt = '';
        btnCancelaEvento.title = 'Cancela e descarta toda alteracao do codigo';
        btnCancelaEvento.style.cursor = 'pointer';
        btnCancelaEvento.onclick = function() {
            document.body.removeChild(divEditorEvento);
            editandoProriedade = false;
        }
        
        if(prop.tipo === JSDialogEdit.Propriedade.Tipos.Funcao) {
            editorEvento = document.createElement('pre');
            editorEvento.innerHTML = src;
            editorEvento.style.top = '26px';
            editorEvento.style.bottom = '0px';
            editorEvento.style.left = '0px';
            editorEvento.style.right = '0px';
            editorEvento.style.position = 'absolute';
        } else {
            editorEvento = document.createElement('textarea');
            editorEvento.value = src;
            editorEvento.style.width = (parseInt(divEditorEvento.style.width , 10) - 8) + 'px';
            editorEvento.style.height = (parseInt(divEditorEvento.style.height, 10) - 34) + 'px';
        }
        editorEvento.id = 'editorEvento_' + evento + '_' + idSelecao;
        editorEvento.onfocus = function(){
            editandoProriedade = true;
            divEditorEvento.style.zIndex = '1001';
        };
        editorEvento.onblur = function(){
            editandoProriedade = false;
            divEditorEvento.style.zIndex = '1000';
        };
        editorEvento.onkeypress = function(e) {
            e = e ? e : event;
            if(e.keyCode == 27) btnCancelaEvento.click();
        };
        
        barraEditorEvento.appendChild(btnCancelaEvento);
        barraEditorEvento.appendChild(btnConfirmaEvento);
        barraEditorEvento.appendChild(document.createTextNode(tituloEditor));
        divEditorEvento.appendChild(barraEditorEvento);
        divEditorEvento.appendChild(editorEvento);
        
        document.body.appendChild(divEditorEvento);
        editorEvento.focus();
        
        if(prop.tipo === JSDialogEdit.Propriedade.Tipos.Funcao) {
            aceEditor = ace.edit(editorEvento.id);
            aceEditor.getSession().setMode("ace/mode/javascript");
            aceEditor.setOptions({
                enableBasicAutocompletion: true
            });
            
            aceEditor.on("focus", function () {
                editandoProriedade = true;
                divEditorEvento.style.zIndex = '1001';
            });
            aceEditor.on("blur", function () {
                editandoProriedade = false;
                divEditorEvento.style.zIndex = '1001';
            });
            aceEditor.on("keypress", function (e) {
                e = e ? e : event;
                if(e.keyCode == 27) btnCancelaEvento.click();
            });
            
            aceEditor.focus();
        }
    }; */
    
    var selecionaDocumento = function ___jsde_editor_inner_selecionaDocumento(i) {
        if(i === undefined) {
            docSelecionado = null;
            document.title = JSDialogEdit.version;
            document.getElementById("btnDesfazer").disabled = true;
            document.getElementById("btnRefazer").disabled = true;
            document.getElementById("btnDesfazer").title = tituloDesRefazer("Desfazer", null);
            document.getElementById("btnRefazer").title = tituloDesRefazer("Refazer", null);
            window.JSDEGerenciadorJanela.setFocus(null);
            if(arvoreComponentes) janComponentes.removeFilho(arvoreComponentes);
            arvoreComponentes = null;
			
			barraFerramentas.btnSalvar.setDesabilitado(true);
			barraFerramentas.btnSalvarComo.setDesabilitado(true);
        } else {
            if(docSelecionado == i) return;
            divSelecao.style.display = 'none';
            docSelecionado = i;
            document.title = (documentos[docSelecionado].alterado?'*':'') + documentos[docSelecionado].nome + ' - ' + JSDialogEdit.version;
            window.JSDEGerenciadorJanela.setFocus(documentos[docSelecionado].conteudo);
            
            configuraBotaoDesRefazer("Desfazer", documentos[docSelecionado].desfazer);
            configuraBotaoDesRefazer("Refazer", documentos[docSelecionado].refazer);
            if(arvoreComponentes) janComponentes.removeFilho(arvoreComponentes);
            arvoreComponentes = documentos[docSelecionado].arvore;
            janComponentes.addFilho(arvoreComponentes);
            recarregaArvore();
			
			barraFerramentas.btnSalvar.setDesabilitado(!documentos[docSelecionado].alterado);
			barraFerramentas.btnSalvarComo.setDesabilitado(false);
        }
        
        atualizaSaida();
    };
    
    var alteraPropriedade = function(e) {
        e = e || event;
        var itemDesfazer = new JSDialogEdit.Editor.Acao();
        var _target = e.target ? e.target : e.srcElement,
            item = this.id.split('_')[1],
            prop = objSelecionado.getPropriedade(item),
            key = e.keyCode,
            erro = false,
            x = 0,
            codigo = 0,
            valor = null;
        
        if(key == 27) return false;
        valor = this.value;
        if(prop == null) prop = objSelecionado.getEvento(item);
        
        if(prop.nome === 'ID') {
            if(valor === '') {
                erro = true;
            } else {
                for(x = 0; x < valor.length; x++) {
                    codigo = valor.charCodeAt(x);
                    if((codigo >= 65 && codigo <= 90) ||            // A..Z
                       (codigo >= 97 && codigo <= 122) ||           // a..z
                       (x > 0 && codigo >= 48 && codigo <= 57) ||   // 0..9
                       (x > 0 && codigo == 45) ||                   // '-'
                       (x > 0 && codigo == 95)) {                   // '_'
                        continue;
                    } else {
                        erro = true;
                        break;
                    }
                }
            }
            if(!erro && documentos[docSelecionado].conteudo.findFilho(valor) != null) erro = true;
            
            if(erro) {
                alert('Valor invalido ou ja existe um componente com este ID:' + valor);
                carregarPropriedades();
                return false;
            }
            
            // Google Chrome bug: calls "onchange" when input field is removed from DOM
            if(JSDialogEdit.Core.getBrowser().indexOf('chrome') !== -1) this.onchange = function () {};
        }
        
        if(prop.get) {
            itemDesfazer.acao = "propriedade";
            itemDesfazer.objeto = objSelecionado;
            itemDesfazer.propriedade = prop;
            itemDesfazer.valor = objSelecionado[prop.get]();
            adicionaDesfazer(itemDesfazer);
        }
        
        switch(prop.tipo) {
            case JSDialogEdit.Propriedade.Tipos.Boolean:
                objSelecionado[prop.set](this.checked);
                break;
            case JSDialogEdit.Propriedade.Tipos.Objeto:
                var tbd = _target.parentNode.nextElementSibling.lastChild;
                var obj = new Object();
                for(var i = 0; i < tbd.rows.length; i++) {
                    if(tbd.rows[i].childNodes[1].firstChild.value == '') continue;
                    obj[tbd.rows[i].childNodes[1].firstChild.value] = tbd.rows[i].childNodes[2].firstChild.value;
                }
                objSelecionado[prop.set](obj);
                tbd.parentNode.parentNode.firstChild.style.display = 'block';
                tbd.parentNode.parentNode.removeChild(tbd.parentNode.parentNode.lastChild);
                break;
            case JSDialogEdit.Propriedade.Tipos.Acao:
                objSelecionado[prop.funcao]();
                break;
            case JSDialogEdit.Propriedade.Tipos.Numero:
                if(isNaN(valor)) {
                    alert('Valor ' + valor + ' não é um numero válido');
                    carregarPropriedades();
                    return false;
                }
                
                try {
                    valor = parseInt(valor, 10);
                    objSelecionado[prop.set](valor);
                } catch (ex){
                    alert("Valor " + valor + " não é um numero válido\n" + ex);
                    return false;
                }
                break;
            default:
                objSelecionado[prop.set](valor);
                break;
        }
        editandoProriedade = false;
        documentoAlterado(true);
        atualizaSaida();
        carregarPropriedades();
        atualizaSelecao();
        if(prop.refresh) recarregaArvore();
            
        return true;
    }
    
    var documentoAlterado = function(v) {
        documentos[docSelecionado].alterado = v;
		
		if(v) {
			if(document.title.indexOf('*') != 0) document.title = '*' + document.title;
			barraFerramentas.btnSalvar.setDesabilitado(false);
		} else {
			if(document.title.indexOf('*') != 0) document.title = '*' + document.title;
			barraFerramentas.btnSalvar.setDesabilitado(true);
		}
    }
    
    var atualizaSaida = function() {
        if(docSelecionado === null) {
            janSaida.getFilho('txtSaida').setValor('');
        } else {
            var codigo = documentos[docSelecionado].conteudo.toObject();
            janSaida.getFilho('txtSaida').setValor(JSON.stringify(codigo));
        }
    }
    
    var recarregaArvore = function() {
        if(arvoreComponentes.getFilhos().length > 0) arvoreComponentes.removeFilho(arvoreComponentes.getFilhos()[0]);
        if(docSelecionado === null) return;
        
        var raiz = new JSDialogEdit.TreeView.No({
            'ID':'jsdeTree_' + documentos[docSelecionado].conteudo.getId(),
            'Texto':documentos[docSelecionado].conteudo.getId(),
            'Valor':documentos[docSelecionado].conteudo.getId(),
            'Icone':JSDialogEdit.pastaImagens + documentos[docSelecionado].conteudo.CLASSE.replace('JSDialogEdit.', '') + '.png'
        });
        JSDialogEdit.Core.capturaEvento(raiz.getElemento(), 'click', function ___jsde_editor_inner_recarregaarvore_raiz_inner_click(e) {
            var id = raiz.getTexto();
            for(var x = 0; x < documentos.length; x++) {
                if(documentos[x].conteudo.getId() == id) {
                    selecionaObjeto(documentos[x].conteudo);
                    break;
                }
            }
        });
        var itens = documentos[docSelecionado].conteudo.getFilhos();
        for(var x = 0; x < itens.length; x++) adicionaNo(raiz, itens[x]);
        
        arvoreComponentes.addFilho(raiz);
        
        if(objSelecionado) arvoreComponentes.setValor(objSelecionado.getId());
    };
    
    var adicionaNo = function(raiz, item) {
        var filho = new JSDialogEdit.TreeView.No({
            ID:'jsdeTree_' + item.getId(),
            Texto:item.getId(),
            Valor:item.getId(),
            Tooltip:item.getId() + " [" + item.CLASSE + "]",
            Icone:JSDialogEdit.pastaImagens + item.CLASSE.replace('JSDialogEdit.', '') + '.png'
        });
        JSDialogEdit.Core.capturaEvento(filho.getElemento(), 'click', function(e) {
            e = e ? e : event;
            var id = filho.getTexto();
            var componentes = documentos[docSelecionado].conteudo.getFilhos();
            buscaNo(id, componentes);
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
        });
        raiz.addFilho(filho);
        
        var subitens = item.getFilhos ? item.getFilhos() : [];
        for(var x = 0; x < subitens.length; x++) {
            adicionaNo(filho, subitens[x]);
        }
    }
    
    var buscaNo = function(id, lista) {
        for(var x = 0; x < lista.length; x++) {
            if(lista[x].getId() == id && lista[x]) {
                selecionaObjeto(lista[x]);
                return true;
            } else if(lista[x].getFilhos) {
                if(buscaNo(id, lista[x].getFilhos())) return true;
            }
        }
        
        return false;
    }
    
    var testarCodigo = function() {
        if(docSelecionado == null) return;
        var j = window.open('','dialog','resizable=no,scrollbars=no,status=no,top=0,left=0,width=800,height=600');
        j.document.open();
        j.document.write('<'+'!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">' + "\n");
        j.document.write('<'+'html>' + "\n");
        j.document.write('<'+'head>' + "\n");
        j.document.write('<'+'title>Teste de Janela ['+documentos[docSelecionado].conteudo.getTitulo()+']<'+'/title>' + "\n");
        for(var x = 0; x < folhasEstilo.length; x++) {
            j.document.write(folhasEstilo[x].outerHTML);
        }
        j.document.write('<'+'link rel="Stylesheet" type="text/css" href="css/componentes.css">' + "\n");
        j.document.write('<'+'link rel="shortcut icon" href="'+JSDialogEdit.pastaImagens+'icon_dialog_edit.png">' + "\n");
        j.document.write('<'+'script type="text/javascript" src="js/core.js"><'+'/script>' + "\n");
        j.document.write('<'+'script type="text/javascript">' + "\n");
        j.document.write('var inicio = new Date();' + "\n\n");
        j.document.write('function addLog(msg, dia) {' + "\n");
        j.document.write('   dia = dia || new Date();' + "\n");
        j.document.write('   dia = dia.toTimeString().split(" ")[0] + "." + dia.getMilliseconds();' + "\n");
        j.document.write('   var log = document.getElementById("jsdeDivLog");' + "\n");
        j.document.write('   log.innerHTML = "[" + dia + "] " + msg + "<br>" + log.innerHTML;' + "\n");
        j.document.write('}' + "\n\n");
        j.document.write('window.onerror = function (desc, page, line, chr) {' + "\n");
        j.document.write('   addLog("<span style=\'color:red\'>" + desc + " - " + page + ":" + line + "</span>")' + "\n");
        j.document.write('};' + "\n\n");
        j.document.write('function init() {' + "\n");
        j.document.write('   addLog("Iniciando...", inicio);' + "\n\n");
        j.document.write('   JSDialogEdit.Core.onParse = function(item){' + "\n");
        j.document.write('      addLog("Processando Objeto: " + item)' + "\n");
        j.document.write('   };' + "\n");
        j.document.write('   var t = ' + janSaida.getFilho('txtSaida').getValor() + "\n");
        j.document.write('   var p = JSDialogEdit.parseDialog(t);' + "\n");
        j.document.write('}' + "\n");
        j.document.write('<'+'/script>' + "\n");
        // gambiarra para o IE8 esperar o carregamento dos arquivos externos e nao travar
        window.setTimeout(function() {
            j.document.write('<'+'/head>' + "\n");
            j.document.write('<'+'body onload="init()">' + "\n");
            j.document.write('<'+'div id="jsdeDivLog" class=""></div>' + "\n");
            j.document.write('<'+'/body>' + "\n");
            j.document.write('<'+'/html>');
            j.document.close();
        }, 300);
    }
    
    var alinharGrade = function() {
        var botao = document.getElementById('btnGrade');
        if(GRADE == 1) {
            GRADE = 10;
            botao.className = 'jsde_Botao jsde_Botao_precionado';
        } else {
            GRADE = 1;
            botao.className = 'jsde_Botao';
        }
    }
    
    var alteraIdioma = function ___jsde_editor_inner_alteraIdioma() {
        var idioma = this.getTexto().split("-")[1].substr(1, 10);
        editorIdioma.setIdioma(idioma);
        
        selecionaDocumento(undefined);
        selecionaObjeto(undefined);
    }
    
    var criaBotaoFerramenta = function(id, tooltip, img, classe, atalho) {
        var btn = new JSDialogEdit.Botao({
            ID:id,
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:___JSDEIDIOMA[tooltip] || tooltip,
            Classe:'jsde_Botao',
            Estilos:{cursor:"url("+JSDialogEdit.pastaImagens+"icon_hand.png), default"}
        });
        editorIdioma.addComponente(btn, 'Tooltip');
        
        btn.registraEvento('mousedown', function(e) {
            e = e ? e : event;
            divDrop.style.display = 'block';
            divDrop.style.top = (e.clientY + 2) + 'px';
            divDrop.style.left = (e.clientX + 2) + 'px';
            divDrop.style.backgroundImage = this.getEstilo('backgroundImage');
            JSDialogEdit.dragComp = divDrop;
            novo = classe;
            document.body.className = "novoComponente";
        });
        
        btn.addEstilo('backgroundImage', 'url(' + JSDialogEdit.pastaImagens + img + ')');
        if(atalho) btn.setTooltip(btn.getTooltip() + ' (' + atalho + ')')
        
        return btn;
    }
    
    var ativaAbaPropriedade = function ___jsde_editor_inner_ativaAbaPropriedade(aba) {
        if(aba == 'propriedades') {
            divAbaProp.className = 'ativo';
            divAbaEvt.className = '';
            divProp.style.display = 'block';
            divEvt.style.display = 'none';
        } else if(aba == 'eventos') {
            divAbaEvt.className = 'ativo';
            divAbaProp.className = '';
            divEvt.style.display = 'block';
            divProp.style.display = 'none';
        }
    }
    
    var criaItemMenuRecente = function ___jsde_editor_inner_criaItemMenuRecente(item) {
        var menuRecenteItem = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuRecenteItem_" + item.nome,
            "Texto":item.nome,
            "Icone":item.formato === 'xml' ? JSDialogEdit.pastaImagens+"icon_tag.png" : JSDialogEdit.pastaImagens+"icon_script.png"
        });
        menuRecenteItem.setOnClickFunction(function() {
            var recent = retornaRecentes();
            var estrutura = {};
            estrutura.nome = this.getTexto();
            for(var r = 0; r < recent.length; r++) {
                if(recent[r].nome === estrutura.nome || recent[r].nome === (estrutura.nome + '.' + estrutura.formato)) {
                    estrutura.storageURL = recent[r].local;
                    estrutura.storage = recent[r].local == null ? 'local' : 'rede';
                    estrutura.formato = recent[r].formato;
                    break;
                }
            }
            abrirEstrutura(estrutura);
        });
        
        return menuRecenteItem;
    }
    
    var adicionaDesfazer = function ___jsde_editor_inner_adicionaDesfazer(item, manterRefazer) {
        documentos[docSelecionado].desfazer.push(item);
        document.getElementById("btnDesfazer").disabled = false;
        document.getElementById("btnDesfazer").title = tituloDesRefazer("Desfazer", item);
        
        if(manterRefazer !== true) {
            documentos[docSelecionado].refazer = [];
            document.getElementById("btnRefazer").disabled = true;
            document.getElementById("btnRefazer").title = tituloDesRefazer("Refazer", null);
        }
    }
    
    var adicionaRefazer = function ___jsde_editor_inner_adicionaRefazer(item) {
        documentos[docSelecionado].refazer.push(item);
        document.getElementById("btnRefazer").disabled = false;
        document.getElementById("btnRefazer").title = tituloDesRefazer("Refazer", item);
    }
    
    var desfazerAcao = function ___jsde_editor_inner_desfazerAcao() {
        var item = documentos[docSelecionado].desfazer.pop();
        if(item) {
            item.valor = aplicaAcao(item);
            adicionaRefazer(item);
        }
        
        configuraBotaoDesRefazer("Desfazer", documentos[docSelecionado].desfazer);
    }
    
    var refazerAcao = function ___jsde_editor_inner_refazerAcao() {
        var item = documentos[docSelecionado].refazer.pop();
        if(item) {
            item.valor = aplicaAcao(item);
            adicionaDesfazer(item, true);
        }
        
        configuraBotaoDesRefazer("Refazer", documentos[docSelecionado].refazer);
    }
    
    var aplicaAcao = function ___jsde_editor_inner_aplicaAcao(item) {
        var x, valorAnterior;
        
        switch(item.acao) {
            case "propriedade":
                valorAnterior = item.objeto[item.propriedade.get]();
                item.objeto[item.propriedade.set](item.valor);
                break;
            case "resize":
            case "drag":
                valorAnterior = [];
                for(x = 0; x < item.propriedade.length; x++) {
                    valorAnterior.push(item.objeto[item.propriedade[x].get]());
                    item.objeto[item.propriedade[x].set](item.valor[x]);
                }
                break;
            case "adicionar":
                item.propriedade.removeFilho(item.objeto);
                item.acao = "remover";
                if(objSelecionado === item.objeto) selecionaObjeto(item.propriedade);
                recarregaArvore();
                break;
            case "remover":
                item.propriedade.addFilho(item.objeto);
                item.acao = "adicionar";
                recarregaArvore();
                break;
            default:
                break;
        }
        
        documentoAlterado(true);
        atualizaSaida();
        carregarPropriedades();
        atualizaSelecao();
        if(item.propriedade.refresh) recarregaArvore();
        
        return valorAnterior;
    }
    
    var tituloDesRefazer = function ___jsde_editor_inner_tituloDesRefazer(botao, item) {
        if(item) {
            return ___JSDEIDIOMA[botao] + ": " + ___JSDEIDIOMA[item.acao] + " " + item.objeto.getId();
        } else {
            return ___JSDEIDIOMA[botao];
        }
    }
    
    var configuraBotaoDesRefazer = function ___jsde_editor_inner_configuraBotaoDesRefazer(botao, listaAcao) {
        if(listaAcao.length == 0) {
            document.getElementById("btn" + botao).disabled = true;
            document.getElementById("btn" + botao).title = botao;
        } else {
            document.getElementById("btn" + botao).disabled = false;
            document
            .getElementById("btn" + botao)
            .title = tituloDesRefazer(botao, listaAcao[listaAcao.length - 1]);
        }
    }
    
    var montaBarraComponentes = function ___jsde_editor_inner_montaBarraComponentes(barra) {
        var btnExpandir, btnRecolher, btnMoverBaixo, btnMoverCima, btnMoverEsquerda, btnMoverDireita;

        btnExpandir = new JSDialogEdit.Botao({
            ID : "jsde_btnExpandirBarraComponentes",
            Tipo : JSDialogEdit.Botao.TiposBotao.BOTAO,
            Valor : "",
            Tooltip : ___JSDEIDIOMA["Expandir Tudo"] || "Expandir Tudo",
            Classe : "jsde_Botao"
        });
        btnExpandir.setOnClickFunction(function (){
            var itens = arvoreComponentes.getDescendentes();
            for(var x = 0; x < itens.length; x++) {
                itens[x].expand();
            }
        });
        
        btnRecolher = new JSDialogEdit.Botao({
            ID : "jsde_btnRecolherBarraComponentes",
            Tipo : JSDialogEdit.Botao.TiposBotao.BOTAO,
            Valor : "",
            Tooltip : ___JSDEIDIOMA["Recolher Tudo"] || "Recolher Tudo",
            Classe : "jsde_Botao"
        });
        btnRecolher.setOnClickFunction(function (){
            var itens = arvoreComponentes.getDescendentes();
            for(var x = 0; x < itens.length; x++) {
                itens[x].collapse();
            }
        });
        
        btnMoverBaixo = new JSDialogEdit.Botao({
            ID : "jsde_btnMoverBaixoBarraComponentes",
            Tipo : JSDialogEdit.Botao.TiposBotao.BOTAO,
            Valor : "",
            Tooltip : "Mover para cima",
            Classe : "jsde_Botao"
        });
        btnMoverBaixo.setOnClickFunction(function (){
            if(objSelecionado == documentos[docSelecionado].conteudo) return;
            
            var proximo = buscaComponenteSeguinte(objSelecionado.getConteiner(), objSelecionado.getId());
        });
        
        btnMoverCima = new JSDialogEdit.Botao({
            ID : "jsde_btnMoverCimaBarraComponentes",
            Tipo : JSDialogEdit.Botao.TiposBotao.BOTAO,
            Valor : "",
            Tooltip : "Mover para baixo",
            Classe : "jsde_Botao"
        });
        btnMoverCima.setOnClickFunction(function (){
        });
        
        btnMoverEsquerda = new JSDialogEdit.Botao({
            ID : "jsde_btnMoverEsquerdaBarraComponentes",
            Tipo : JSDialogEdit.Botao.TiposBotao.BOTAO,
            Valor : "",
            Tooltip : "Mover para fora do Conteiner",
            Classe : "jsde_Botao"
        });
        btnMoverEsquerda.setOnClickFunction(function (){
        });
        
        btnMoverDireita = new JSDialogEdit.Botao({
            ID : "jsde_btnMoverDireitaBarraComponentes",
            Tipo : JSDialogEdit.Botao.TiposBotao.BOTAO,
            Valor : "",
            Tooltip : "Mover para dentro do Conteiner",
            Classe : "jsde_Botao"
        });
        btnMoverDireita.setOnClickFunction(function (){
        });
        
        barra.addFilho(btnExpandir);
        barra.addFilho(btnRecolher);
        //barra.addFilho(btnMoverBaixo);
        //barra.addFilho(btnMoverCima);
        //barra.addFilho(btnMoverEsquerda);
        //barra.addFilho(btnMoverDireita);
        
        editorIdioma.addComponente(btnExpandir, 'Tooltip');
        editorIdioma.addComponente(btnRecolher, 'Tooltip');
    }
    
    var montaBarraMenu = function ___jsde_editor_inner_montaBarraMenu() {
        var menuNovo = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuNovo",
            "Texto":___JSDEIDIOMA["Novo"] || "Novo",
            "Icone":JSDialogEdit.pastaImagens+"icon_novo.gif"
        });
        menuNovo.setOnClickFunction(novoDocumento);
        var menuAbrir = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuAbrir",
            "Texto":___JSDEIDIOMA["Abrir..."] || "Abrir...",
            "Icone":JSDialogEdit.pastaImagens+"icon_pasta.gif"
        });
        menuAbrir.setOnClickFunction(abrir);
        var menuSalvar = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuSalvar",
            "Texto":___JSDEIDIOMA["Salvar"] || "Salvar",
            "Icone":JSDialogEdit.pastaImagens+"icon_disco.gif"
        });
        menuSalvar.setOnClickFunction(salvar);
        var menuSalvarComo = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuSalvarComo",
            "Texto":___JSDEIDIOMA["Salvar Como..."] || "Salvar Como...",
            "Icone":JSDialogEdit.pastaImagens+"icon_disco_edit.png"
        });
        menuSalvarComo.setOnClickFunction(salvarComo);
        var menuPropriedades = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuPropriedades",
            "Texto":___JSDEIDIOMA["Propriedades..."] || "Propriedades...",
            "Icone":JSDialogEdit.pastaImagens+"icon_property.png"
        });
        menuPropriedades.setOnClickFunction(propriedadesArquivo);
        var menuRecentes = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuRecentes",
            "Texto":___JSDEIDIOMA["Recentes"] || "Recentes",
            "Icone":JSDialogEdit.pastaImagens+"icon_pasta_recente.png"
        });
        var listaRecente = retornaRecentes();
        for(var x = 0; x < listaRecente.length; x++) {
            var menuRecenteItem = criaItemMenuRecente(listaRecente[x]);
            menuRecentes.addFilho(menuRecenteItem);
        }
        var menuImportar = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuImportar",
            "Texto":___JSDEIDIOMA["Importar"] || "Importar",
            "Icone":JSDialogEdit.pastaImagens+"icon_import.png"
        });
        menuImportar.setOnClickFunction(importar);
        var menuExportar = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuExportar",
            "Texto":___JSDEIDIOMA["Exportar"] || "Exportar",
            "Icone":JSDialogEdit.pastaImagens+"icon_export.png"
        });
        menuExportar.setOnClickFunction(exportar);
        
        var menuArquivo = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuArquivo",
            "Texto":___JSDEIDIOMA["Arquivo"] || "Arquivo"
        });
        menuArquivo.addFilho(menuNovo);
        menuArquivo.addFilho(menuAbrir);
        menuArquivo.addFilho(menuSalvar);
        menuArquivo.addFilho(menuSalvarComo);
        menuArquivo.addFilho(menuPropriedades);
        menuArquivo.addFilho(new JSDialogEdit.MenuItem({"Texto":"-"}));
        menuArquivo.addFilho(menuRecentes);
        menuArquivo.addFilho(new JSDialogEdit.MenuItem({"Texto":"-"}));
        menuArquivo.addFilho(menuImportar);
        menuArquivo.addFilho(menuExportar);
        
        var menuCopiar = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuCopiar",
            "Texto":"Copiar",
            "Icone":JSDialogEdit.pastaImagens+"icon_copy.png"
        });
        menuCopiar.setOnClickFunction(copiar);
        var menuRecortar = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuRecortar",
            "Texto":"Recortar",
            "Icone":JSDialogEdit.pastaImagens+"icon_cut.png"
        });
        menuRecortar.setOnClickFunction(recortar);
        var menuColar = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuColar",
            "Texto":"Colar",
            "Icone":JSDialogEdit.pastaImagens+"icon_paste.png"
        });
        menuColar.setOnClickFunction(colar);
        var menuIdiomaPTBR = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuIdiomaPTBR",
            "Texto":"Portugues - ptBR"
        });
        menuIdiomaPTBR.setOnClickFunction(alteraIdioma);
        var menuIdiomaEN = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuIdiomaEN",
            "Texto":"English - en"
        });
        menuIdiomaEN.setOnClickFunction(alteraIdioma);
        var menuIdioma = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuIdiomo",
            "Texto":"Idioma"
        });
        menuIdioma.addFilho(menuIdiomaPTBR);
        menuIdioma.addFilho(menuIdiomaEN);
        
        var menuEditar = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuEditar",
            "Texto":"Editar"
        });
        menuEditar.addFilho(menuCopiar);
        menuEditar.addFilho(menuRecortar);
        menuEditar.addFilho(menuColar);
        menuEditar.addFilho(new JSDialogEdit.MenuItem({"Texto":"-"}));
        menuEditar.addFilho(menuIdioma);
        
        var menuJanFerramentas = new JSDialogEdit.MenuItem({
            "ID":"menuJanFerramentas",
            "Texto":"Ferramentas",
            "Tipo":"caixaselecao",
            "Icone":JSDialogEdit.pastaImagens+"icon_tools.gif"
        });
        menuJanFerramentas.setOnClickFunction(function(){janCaixaFerramentas.setVisivel(!janCaixaFerramentas.getVisivel())});
        var menuJanPropriedades = new JSDialogEdit.MenuItem({
            "ID":"menuJanPropriedades",
            "Texto":"Propriedades",
            "Tipo":"caixaselecao",
            "Icone":JSDialogEdit.pastaImagens+"icon_documento.gif"
        });
        menuJanPropriedades.setOnClickFunction(function(){janPropriedades.setVisivel(!janPropriedades.getVisivel())});
        var menuJanComponentes = new JSDialogEdit.MenuItem({
            "ID":"menuJanComponentes",
            "Texto":"Componentes",
            "Tipo":"caixaselecao",
            "Icone":JSDialogEdit.pastaImagens+"icon_tree.gif"
        });
        menuJanComponentes.setOnClickFunction(function(){janComponentes.setVisivel(!janComponentes.getVisivel())});
        var menuJanSaida = new JSDialogEdit.MenuItem({
            "ID":"menuJanSaida",
            "Texto":"Codigo",
            "Tipo":"caixaselecao",
            "Icone":JSDialogEdit.pastaImagens+"icon_source.png"
        });
        menuJanSaida.setOnClickFunction(function(){janSaida.setVisivel(!janSaida.getVisivel())});
        var menuExibir = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuExibir",
            "Texto":"Exibir"
        });
        menuExibir.addFilho(menuJanFerramentas);
        menuExibir.addFilho(menuJanPropriedades);
        menuExibir.addFilho(menuJanComponentes);
        menuExibir.addFilho(menuJanSaida);
        
        var menuJanelas = new JSDialogEdit.MenuItem({
            "ID":"jsdeMenuJanelas",
            "Texto":"Janelas"
        });
        
        barraMenu = new JSDialogEdit.MenuConteiner({"ID":"jsdeBarraMenu"});
        barraMenu.getElemento().style.fontFamily = 'Verdana';
        barraMenu.getElemento().style.fontSize = '9pt';
        barraMenu.addFilho(menuArquivo);
        barraMenu.addFilho(menuEditar);
        barraMenu.addFilho(menuExibir);
        barraMenu.addFilho(menuJanelas);
        
        editorIdioma.addComponente(menuArquivo, 'Texto');
        editorIdioma.addComponente(menuNovo, 'Texto');
        editorIdioma.addComponente(menuAbrir, 'Texto');
        editorIdioma.addComponente(menuSalvar, 'Texto');
        editorIdioma.addComponente(menuSalvarComo, 'Texto');
        editorIdioma.addComponente(menuPropriedades, 'Texto');
        editorIdioma.addComponente(menuRecentes, 'Texto');
        editorIdioma.addComponente(menuImportar, 'Texto');
        editorIdioma.addComponente(menuExportar, 'Texto');
        editorIdioma.addComponente(menuEditar, 'Texto');
        editorIdioma.addComponente(menuCopiar, 'Texto');
        editorIdioma.addComponente(menuRecortar, 'Texto');
        editorIdioma.addComponente(menuColar, 'Texto');
        editorIdioma.addComponente(menuIdioma, 'Texto');
        editorIdioma.addComponente(menuExibir, 'Texto');
        editorIdioma.addComponente(menuJanFerramentas, 'Texto');
        editorIdioma.addComponente(menuJanPropriedades, 'Texto');
        editorIdioma.addComponente(menuJanComponentes, 'Texto');
        editorIdioma.addComponente(menuJanSaida, 'Texto');
        editorIdioma.addComponente(menuJanelas, 'Texto');
        
        document.body.appendChild(barraMenu.getElemento());
    }
    
    var montaJanCaixaFerramentas = function ___jsde_editor_inner_montaJanCaixaFerramentas() {
        janCaixaFerramentas = new JSDialogEdit.Janela({
            ID : 'janCaixaFerramentas',
            Titulo : ___JSDEIDIOMA['Ferramentas'] || 'Ferramentas',
            Icone:JSDialogEdit.pastaImagens + 'icon_tools.gif',
            Altura:63, Largura:250, Direita:10, Superior:60,
            Tipo:JSDialogEdit.Janela.TiposJanela.DIALOG
        });
        janCaixaFerramentas.setVisivel(true);
        editorIdioma.addComponente(janCaixaFerramentas, 'Titulo');
        
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnLabel', 'Rotulo', 'Rotulo.png', JSDialogEdit.Rotulo, 'L'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnCaixaTexto', 'Caixa de Texto', 'CaixaTexto.png', JSDialogEdit.CaixaTexto, 'T'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnData', 'Campo de Data', 'CampoData.png', JSDialogEdit.CampoData, 'D'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnBotao', 'Botao', 'Botao.png', JSDialogEdit.Botao, 'B'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnCampoOculto', 'Campo Oculto', 'CampoOculto.png', JSDialogEdit.CampoOculto, 'O'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnMemorando', 'Memorando', 'Memorando.png', JSDialogEdit.Memorando, 'M'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnListaSelecao', 'Lista de Selecao', 'ListaSelecao.png', JSDialogEdit.ListaSelecao, 'S'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnCaixaSelecao', 'Caixa de Selecao', 'CaixaSelecao.png', JSDialogEdit.CaixaSelecao, 'C'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnGrupoBotaoRadio', 'Grupo de Botoes Radio', 'GrupoBotaoRadio.png', JSDialogEdit.GrupoBotaoRadio, 'R'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnSenha', 'Senha', 'Senha.png', JSDialogEdit.Senha, 'H'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnImagem', 'Imagem', 'Imagem.png', JSDialogEdit.Imagem, 'I'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnCaixaGrupo', 'Caixa de Grupo', 'CaixaGrupo.png', JSDialogEdit.CaixaGrupo, 'G'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnPainel', 'Painel', 'Painel.png', JSDialogEdit.Painel, 'P'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnArvore', 'Estrutura em Arvore', 'TreeView.png', JSDialogEdit.TreeView, 'E'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnConexao', 'Conexao XML', 'Conexao.png', JSDialogEdit.Conexao, 'X'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnTemporizador', 'Temporizador', 'Temporizador.png', JSDialogEdit.Temporizador, 'Z'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnPainelAbas', 'Painel Abas', 'PainelAbas.png', JSDialogEdit.PainelAbas, 'A'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnAjax', 'Ajax', 'Ajax.png', JSDialogEdit.Ajax, 'J'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnTabela', 'Tabela', 'Tabela.png', JSDialogEdit.Tabela, 'N'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnMenu', 'Menu', 'MenuConteiner.png', JSDialogEdit.MenuConteiner, 'U'));
        janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnBotaoMenu', 'Botao Menu', 'BotaoMenu.png', JSDialogEdit.BotaoMenu));
        //janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnCalendario', 'Calendario', 'Calendario.png', JSDialogEdit.Calendario));
        //janCaixaFerramentas.addFilho(criaBotaoFerramenta('btnFrame', '[F]rame', 'Frame.png', JSDialogEdit.Frame));
    }
    
    var montaJanPropriedades = function ___jsde_editor_inner_montaJanPropriedades() {
        divPropAba = document.createElement('div');
        divAbaProp = document.createElement('span');
        divAbaEvt = document.createElement('span');

        divAbaProp.id = 'jsde_JanProp_AbaPro';
        divAbaProp.innerHTML = 'Propriedades';
        divAbaProp.className = 'ativo';
        divAbaProp.style.borderRight = '1px solid #000000';
        divAbaProp.onclick = function() {ativaAbaPropriedade('propriedades')};

        divAbaEvt.id = 'jsde_JanProp_AbaEvt';
        divAbaEvt.innerHTML = 'Eventos';
        divAbaEvt.style.borderRight = '1px solid #000000';
        divAbaEvt.onclick = function() {ativaAbaPropriedade('eventos')};

        divPropAba.appendChild(divAbaProp);
        divPropAba.appendChild(divAbaEvt);

        divProp = document.createElement('div');
        divProp.id = 'jsde_divProp';
        
        divEvt = document.createElement('div');
        divEvt.id = 'jsde_divEvt';
        divEvt.style.display = 'none';
        
        janPropriedades = new JSDialogEdit.Janela({
            ID:'janPropriedades', Titulo:'Propriedades', Icone:JSDialogEdit.pastaImagens+'icon_documento.gif',
            Altura:430, Largura:250, Direita:10, Inferior:10,
            Tipo:JSDialogEdit.Janela.TiposJanela.DIALOG
        });
        janPropriedades.setVisivel(true);

        janPropriedades.appendHTMLChild(divPropAba);
        janPropriedades.appendHTMLChild(divProp);
        janPropriedades.appendHTMLChild(divEvt);
        
        editorIdioma.addComponente(janPropriedades, 'Titulo');
        editorIdioma.addElemento(divAbaProp, 'innerHTML');
        editorIdioma.addElemento(divAbaEvt, 'innerHTML');
    }
    
    var montaJanComponentes = function ___jsde_editor_inner_montaJanComponentes() {
        janComponentes = new JSDialogEdit.Janela({
            ID:'janComponentes', Titulo:'Componentes', Icone:JSDialogEdit.pastaImagens+'icon_tree2.gif',
            Altura:300, Largura:240, Direita:280, Inferior:10,
            Tipo:JSDialogEdit.Janela.TiposJanela.DIALOG
        });
        janComponentes.setVisivel(true);
        
        var barraComponentes = new JSDialogEdit.Painel({
            ID : "jsde_barraComponentes",
            Estilos : {
                width : "100%",
                height : "20px",
                borderTop : "none",
                borderLeft : "none",
                borderBottom : "1px solid #000000",
                borderRight : "none",
                backgroundColor : "#E6E6E6"
            }
        });
        
        montaBarraComponentes(barraComponentes);
        janComponentes.addFilho(barraComponentes);
        editorIdioma.addComponente(janComponentes, 'Titulo');
    }
    
    var montaJanSaida = function ___jsde_editor_inner_montaJanSaida() {
        var saida = new JSDialogEdit.Memorando({ID:'txtSaida', Valor:''});
        saida.getElemento().style.width = '100%';
        saida.getElemento().style.height = '100%';
        saida.getElemento().readOnly = 'readonly';
        JSDialogEdit.Core.enableSelection(saida.getElemento());
        
        janSaida = new JSDialogEdit.Janela({
            ID:'janSaida', Titulo:'Codigo', Icone:JSDialogEdit.pastaImagens+'icon_source.png',
            Altura:200, Largura:450, Inferior:10, Esquerda:10,
            Tipo:JSDialogEdit.Janela.TiposJanela.DIALOG
        });
        janSaida.setVisivel(true);
        janSaida.addFilho(saida);
        
        editorIdioma.addComponente(janSaida, 'Titulo');
    }
    
    var montaBarraFerramentas = function ___jsde_editor_inner_montaBarraFerramentas() {
        var btnNovo = new JSDialogEdit.Botao({
            ID:'btnNovo',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Novo',
            Classe:'jsde_Botao'
        });
        var btnAbrir = new JSDialogEdit.Botao({
            ID:'btnAbrir',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Abrir...',
            Classe:'jsde_Botao'
        });
        var btnSalvar = new JSDialogEdit.Botao({
            ID:'btnSalvar',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Salvar',
            Classe:'jsde_Botao'
        });
        var btnSalvarComo = new JSDialogEdit.Botao({
            ID:'btnSalvarComo',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Salvar Como...',
            Classe:'jsde_Botao'
        });
        
        var btnCopiar = new JSDialogEdit.Botao({
            ID:'btnCopiar',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Copiar',
            Classe:'jsde_Botao',
            Desabilitado:true
        });
        var btnRecortar = new JSDialogEdit.Botao({
            ID:'btnRecortar',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Recortar',
            Classe:'jsde_Botao',
            Desabilitado:true
        });
        var btnColar = new JSDialogEdit.Botao({
            ID:'btnColar',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Colar',
            Classe:'jsde_Botao',
            Desabilitado:true
        });
        var btnAplicarEstilo = new JSDialogEdit.Botao({
            ID:'btnAplicarEstilo',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Duplicar Estilo',
            Classe:'jsde_Botao',
            Desabilitado:true
        });
        
        var btnDesfazer = new JSDialogEdit.Botao({
            ID:'btnDesfazer',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Desfazer',
            Classe:'jsde_Botao',
            Desabilitado:true
        });
        var btnRefazer = new JSDialogEdit.Botao({
            ID:'btnRefazer',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Refazer',
            Classe:'jsde_Botao',
            Desabilitado:true
        });
        
        var btnGrade = new JSDialogEdit.Botao({
            ID:'btnGrade',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Alinhar pela Grade',
            Classe:'jsde_Botao jsde_Botao_precionado'
        });
        var btnExecutar = new JSDialogEdit.Botao({
            ID:'btnExecutar',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Executar',
            Classe:'jsde_Botao'
        });
        var btnCSS = new JSDialogEdit.Botao({
            ID:'btnCSS',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Carregar CSS externo',
            Classe:'jsde_Botao'
        });
        
        var btnJanFerramentas = new JSDialogEdit.Botao({
            ID:'btnJanFerramentas',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Exibe/oculta a janela de Ferramentas',
            Classe:'jsde_Botao jsde_Botao_precionado'
        });
        var btnJanPropriedades = new JSDialogEdit.Botao({
            ID:'btnJanPropriedades',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Exibe/oculta a janela de Propriedades',
            Classe:'jsde_Botao jsde_Botao_precionado'
        });
        var btnJanComponentes = new JSDialogEdit.Botao({
            ID:'btnJanComponentes',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Exibe/oculta a janela de Componentes',
            Classe:'jsde_Botao jsde_Botao_precionado'
        });
        var btnJanSaida = new JSDialogEdit.Botao({
            ID:'btnJanSaida',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Exibe/oculta a janela de Saida',
            Classe:'jsde_Botao jsde_Botao_precionado'
        });
        
        var btnJanSobre = new JSDialogEdit.Botao({
            ID:'btnJanSobre',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Sobre...',
            Classe:'jsde_Botao'
        });
        var btnJanDoc = new JSDialogEdit.Botao({
            ID:'btnJanDoc',
            Valor:'',
            Tipo:JSDialogEdit.Botao.TiposBotao.BOTAO,
            Tooltip:'Documentacao',
            Classe:'jsde_Botao'
        });
        
        btnSalvar.setCallback('onclick', salvar);
        btnSalvarComo.setCallback('onclick', salvarComo);
        btnNovo.setCallback('onclick', novoDocumento);
        btnAbrir.setCallback('onclick', abrir);
        btnCopiar.setCallback('onclick', copiar);
        btnRecortar.setCallback('onclick', recortar);
        btnColar.setCallback('onclick', colar);
        btnAplicarEstilo.setCallback('onclick', capturarEstilo);
        btnDesfazer.setCallback('onclick', desfazerAcao);
        btnRefazer.setCallback('onclick', refazerAcao);
        btnExecutar.setCallback('onclick', testarCodigo);
        btnGrade.setCallback('onclick', alinharGrade);
        btnCSS.setCallback('onclick', carregarCSS);
        btnJanFerramentas.setCallback('onclick', function () {
			if(janCaixaFerramentas.getVisivel()) {
				janCaixaFerramentas.setVisivel(false);
				btnJanFerramentas.setClasse('jsde_Botao');
			} else {
				janCaixaFerramentas.setVisivel(true);
				btnJanFerramentas.setClasse('jsde_Botao jsde_Botao_precionado');
			}
		});
        btnJanPropriedades.setCallback('onclick', function () {
			if(janPropriedades.getVisivel()) {
				janPropriedades.setVisivel(false);
				btnJanPropriedades.setClasse('jsde_Botao');
			} else {
				janPropriedades.setVisivel(true);
				btnJanPropriedades.setClasse('jsde_Botao jsde_Botao_precionado');
			}
		});
        btnJanComponentes.setCallback('onclick', function () {
			if(janComponentes.getVisivel()) {
				janComponentes.setVisivel(false);
				btnJanComponentes.setClasse('jsde_Botao');
			} else {
				janComponentes.setVisivel(true);
				btnJanComponentes.setClasse('jsde_Botao jsde_Botao_precionado');
			}
		});
        btnJanSaida.setCallback('onclick', function () {
			if(janSaida.getVisivel()) {
				janSaida.setVisivel(false);
				btnJanSaida.setClasse('jsde_Botao');
			} else {
				janSaida.setVisivel(true);
				btnJanSaida.setClasse('jsde_Botao jsde_Botao_precionado');
			}
		});
        btnJanSobre.setCallback('onclick', function(){
            var sobre = {"classe":"JSDialogEdit.Janela",
                        "atributos":{"ID":"jnlSobre","Largura":468,"Altura":342,"Tipo":3,"Titulo":"JSDEV3 - " + JSDialogEdit.version,"AcaoFechar":1,
                        "Exibicao":"hidden","Icone":JSDialogEdit.pastaImagens+"icon_help.png"},"filhos":[{"classe":"JSDialogEdit.Rotulo","atributos":
                        {"ID":"Rotulo3","Valor":"Autor: <b>Teo Venier</b> - <a href=\"http://code.google.com/p/jsdialogedit/\" target=" +
                        "\"_blank\">http://code.google.com/p/jsdialogedit/</a><br>Copyright (C) 2011-2014  Teo Venier<br><br><b>JSDialogEdit</b> " +
                        "is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as " +
                        "published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version." +
                        "<br><br><b>JSDialogEdit</b> is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without " +
                        "even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public " +
                        "License for more details.<br><br>You should have received a copy of the GNU General Public License along with " +
                        "JSDialogEdit.  If not, see <a href=\"http://www.gnu.org/licenses/\" target=\"_blank\">http://www.gnu.org/licenses/</a>.",
                        "Largura":381,"Superior":10,"Esquerda":70,"Estilos":{"fontFamily":"Arial","fontSize":"9pt","textAlign":"justify"},
                        "Visivel":true}},{"classe":"JSDialogEdit.Imagem","atributos":{"ID":"Imagem1","Largura":48,"Altura":48,"Superior":10,
                        "Esquerda":10,"Estilos":{},"Visivel":true,"Imagem":JSDialogEdit.pastaImagens+"JSDEV3.png"}},{"classe":"JSDialogEdit.Painel","atributos":
                        {"ID":"Painel1","Largura":466,"Altura":70,"Superior":250,"Esquerda":null,"Estilos":{"border":"none",
                        "backgroundColor":"#E6E6E6"},"Visivel":true},"filhos":[{"classe":"JSDialogEdit.Botao","atributos":{"ID":"btnFechar",
                        "Valor":"Fechar","Largura":90,"Superior":20,"Esquerda":358,"Estilos":{},"Visivel":true,"Tipo":"cancel"}}]}]};
            
            JSDialogEdit.parseDialog(sobre);
        });
        btnJanDoc.setCallback('onclick', function(){window.open('doc/index.html')});
        
        barraFerramentas = new JSDialogEdit.Painel({ID:'pnlBarraMenu', Altura: 22});
        barraFerramentas.getElemento().style.width = '100%';
        barraFerramentas.getElemento().style.padding = '2px';
        if(JSDialogEdit.Core.getBrowser().indexOf('gecko') != -1) barraFerramentas.getElemento().style.clip = '';
        
        barraFerramentas.addFilho(btnNovo);
        barraFerramentas.addFilho(btnAbrir);
        barraFerramentas.addFilho(btnSalvar);
        barraFerramentas.addFilho(btnSalvarComo);
        barraFerramentas.addFilho(new JSDialogEdit.Rotulo({
            ID:'espaco'+(new Date()).getTime(),
            Valor:'',
            Estilos:{'border':'1px outset #CCCCCC', 'margin':'0px 4px 0px 4px'}
        }));
        barraFerramentas.addFilho(btnCopiar);
        barraFerramentas.addFilho(btnRecortar);
        barraFerramentas.addFilho(btnColar);
        barraFerramentas.addFilho(btnAplicarEstilo);
        barraFerramentas.addFilho(new JSDialogEdit.Rotulo({
            ID:'espaco',
            Valor:'',
            Estilos:{'border':'1px outset #CCCCCC', 'margin':'0px 4px 0px 4px'}
        }));
        barraFerramentas.addFilho(btnDesfazer);
        barraFerramentas.addFilho(btnRefazer);
        barraFerramentas.addFilho(new JSDialogEdit.Rotulo({
            ID:'espaco'+(new Date()).getTime(),
            Valor:'',
            Estilos:{'border':'1px outset #CCCCCC', 'margin':'0px 4px 0px 4px'}
        }));
        barraFerramentas.addFilho(btnGrade);
        barraFerramentas.addFilho(btnExecutar);
        barraFerramentas.addFilho(btnCSS);
        barraFerramentas.addFilho(new JSDialogEdit.Rotulo({
            ID:'espaco'+(new Date()).getTime(),
            Valor:'',
            Estilos:{'border':'1px outset #CCCCCC', 'margin':'0px 4px 0px 4px'}
        }));
        barraFerramentas.addFilho(btnJanFerramentas);
        barraFerramentas.addFilho(btnJanPropriedades);
        barraFerramentas.addFilho(btnJanComponentes);
        barraFerramentas.addFilho(btnJanSaida);
        barraFerramentas.addFilho(new JSDialogEdit.Rotulo({
            ID:'espaco'+(new Date()).getTime(),
            Valor:'',
            Estilos:{'border':'1px outset #CCCCCC', 'margin':'0px 4px 0px 4px'}
        }));
        barraFerramentas.addFilho(btnJanDoc);
        barraFerramentas.addFilho(btnJanSobre);
        document.body.appendChild(barraFerramentas.getElemento());
        
        editorIdioma.addComponente(btnNovo, 'Tooltip');
        editorIdioma.addComponente(btnAbrir, 'Tooltip');
        editorIdioma.addComponente(btnSalvar, 'Tooltip');
        editorIdioma.addComponente(btnSalvarComo, 'Tooltip');
        editorIdioma.addComponente(btnCopiar, 'Tooltip');
        editorIdioma.addComponente(btnRecortar, 'Tooltip');
        editorIdioma.addComponente(btnColar, 'Tooltip');
        editorIdioma.addComponente(btnAplicarEstilo, 'Tooltip');
        editorIdioma.addComponente(btnGrade, 'Tooltip');
        editorIdioma.addComponente(btnExecutar, 'Tooltip');
        editorIdioma.addComponente(btnCSS, 'Tooltip');
        editorIdioma.addComponente(btnJanFerramentas, 'Tooltip');
        editorIdioma.addComponente(btnJanPropriedades, 'Tooltip');
        editorIdioma.addComponente(btnJanComponentes, 'Tooltip');
        editorIdioma.addComponente(btnJanSaida, 'Tooltip');
        editorIdioma.addComponente(btnJanDoc, 'Tooltip');
        editorIdioma.addComponente(btnJanSobre, 'Tooltip');
    }

    var vinculaIdioma = function ___jsde_editor_inner_vinculaIdioma() {
    }
    
    var init = function ___jsde_editor_inner_init() {
        var aceScript;
        
        window.__jsdialogedit = 'executanto';
        
        editorIdioma = new JSDialogEdit.Editor.Idioma("ptBR");
        
        JSDialogEdit.Core.capturaEvento(document.body, 'dblclick', function(e){
            e = e || event;
            var _target = e.target || e.srcElement;
            if(_target == document.body) abrir();
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
        });
        JSDialogEdit.Core.capturaEvento(document.body, 'mouseup', function() {
            divDrop.style.display = 'none';
            novo = null;
            if(document.body.className == "novoComponente") document.body.className = "";
        });

        if(JSDialogEdit.Core.getBrowser().indexOf('gecko') != -1) {
            window.onkeypress = handlerTeclado;
        } else {
            window.onkeyup = handlerTeclado;
        }
        document.title = JSDialogEdit.version;

        var icone = document.createElement('link');
        icone.rel  = "shortcut icon";
        icone.type = "image/png";
        icone.href = JSDialogEdit.pastaImagens+"icon_dialog_edit.png";
        document.getElementsByTagName('head')[0].appendChild(icone);
        
        divDrop = document.createElement('div');
        divDrop.id = 'jsde_divDrop';
        divDrop.style.display = 'none';
        document.body.appendChild(divDrop);
        
        divEstilo = document.createElement('div');
        divEstilo.id = "jsde_divEstilo";
        JSDialogEdit.Core.capturaEvento(divEstilo, 'click', function(e) {
            fimAplicarEstilo();
            e = e ? e : event;
            e.cancelBubble = true;
        });
        
        divSelecao = document.createElement('div');
        divSelecao.id = 'jsde_divSelecao';
        divSelecao.className = 'jsdeResize';
        divSelecao.style.display = 'none';
        divSelecao.style.minWidth = '1px';
        divSelecao.style.minHeight = '1px';
        JSDialogEdit.Core.capturaEvento(divSelecao, 'mousedown', function() {
            JSDialogEdit.resizeComp = divSelecao;
            divSelecao.style.minWidth  = (objSelecionado.larguraMin || 16) + 'px';
            divSelecao.style.minHeight = (objSelecionado.alturaMin  || 16) + 'px';
        });
        JSDialogEdit.Core.capturaEvento(document, 'mousemove', function() {
            var largura, altura;
            
            if(JSDialogEdit.resizeComp != divSelecao || !(objSelecionado instanceof JSDialogEdit.Componente)) return;
            if(JSDialogEdit.resizing) {
                if(JSDialogEdit.resizeDir.indexOf('e') != -1 && objSelecionado.resizeAxy.indexOf('x') != -1) {
                    largura = parseInt(divSelecao.style.width, 10) - 10;
                    largura = Math.round(largura / GRADE) * GRADE;
                    objSelecionado.setLargura(largura);
                } else {
                    divSelecao.style.width = (objSelecionado.getLargura() + 5) + "px";
                }
                
                if(JSDialogEdit.resizeDir.indexOf('s') != -1 && objSelecionado.resizeAxy.indexOf('y') != -1) {
                    altura = parseInt(divSelecao.style.height, 10) - 10;
                    altura = Math.round(altura / GRADE) * GRADE;
                    objSelecionado.setAltura(altura);
                } else {
                    divSelecao.style.height = (objSelecionado.getAltura() + 5) + "px";
                }
            }
        });
        JSDialogEdit.Core.capturaEvento(document, 'dblclick', function(e) {
            if(!(objSelecionado instanceof JSDialogEdit.Componente)) {
                e = e || event;
                if(objSelecionado && objSelecionado.eventoPadrao) carregaEditorEvento.call({"id":"evt_" + objSelecionado.eventoPadrao}, e);
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
            }
        });
        document.body.appendChild(divSelecao);

        montaJanCaixaFerramentas();
        montaJanPropriedades();
        montaJanComponentes();
        montaJanSaida();
        montaBarraMenu();
        montaBarraFerramentas();
        vinculaIdioma();
        
        JSDialogEdit.Core.onAfterResize = function() {
            if(this instanceof JSDialogEdit.Janela && this.getMode() !== 'edicao') return;
            documentoAlterado(true);
            carregarPropriedades();
            atualizaSaida();
        };
        JSDialogEdit.Core.onAfterDrag = function() {
            if(!(this instanceof JSDialogEdit.Janela) &&
                (this instanceof JSDialogEdit.Objeto)) {
                documentoAlterado(true);
                atualizaSaida();
            }
        };
        
        JSDialogEdit.Core.onBeforeDrag = function() {
            if(!(this instanceof JSDialogEdit.Janela) &&
                (this instanceof JSDialogEdit.Objeto)) {
                var itemDesfazer = new JSDialogEdit.Editor.Acao();
                itemDesfazer.acao = "drag";
                itemDesfazer.objeto = this;
                itemDesfazer.propriedade = [this.getPropriedade("Superior"), this.getPropriedade("Esquerda")];
                itemDesfazer.valor = [this.getSuperior(), this.getEsquerda()];
                adicionaDesfazer(itemDesfazer);
            }
        }
        JSDialogEdit.Core.onBeforeResize = function() {
            var itemDesfazer = new JSDialogEdit.Editor.Acao();
            itemDesfazer.acao = "resize";
            itemDesfazer.objeto = objSelecionado;
            itemDesfazer.propriedade = [];
            itemDesfazer.valor = [];
            
            if(objSelecionado.resizeAxy.indexOf('x') != -1) {
                itemDesfazer.propriedade.push(objSelecionado.getPropriedade("Largura"))
                itemDesfazer.valor.push(objSelecionado.getLargura());
            }
            
            if(objSelecionado.resizeAxy.indexOf('y') != -1) {
                itemDesfazer.propriedade.push(objSelecionado.getPropriedade("Altura"));
                itemDesfazer.valor.push(objSelecionado.getAltura());
            }
            
            adicionaDesfazer(itemDesfazer);
        }
        
        novoDocumento();
        
        ace.require("ace/ext/language_tools");
    }
    
    init();
}

if(!window.console) {
    window.console = {
        log : function() {
            var div = document.getElementById('jsdeDivLog');
            if(!div) {
                div = document.createElement('div');
                div.id = 'jsdeDivLog';
                div.className = 'jsdeResize';
                document.body.appendChild(div);
            }
            
            var txt = document.createElement('div');
            for(var x = 0; x < arguments.length; x++) txt.innerHTML += arguments[x] + '&nbsp;';
            div.appendChild(txt)
        }
    };
}
/*
function alert(v, callback) {
    JSDialogEdit.Janela.Mensagem({
        "mensagem" : v
    });
}
*/
/*
function prompt(v, p) {
    if(!p) p = '';
    var id = 'ppt' + (new Date()).getTime();
    v += ':<p style="margin:auto"><input type="text" id="'+id+'" style="width:98%" value="'+p+'">'
    JSDialogEdit.Janela.Mensagem({
        "mensagem" : v,
        "botoes"   : ["Ok", "Cancelar"],
        "retorno"  : function(b){
            if(b === 'Ok') {
                return document.getElementById(id).value;
            }
        }
    });
}
*/



