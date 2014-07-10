"use strict";

/*
 *  Autor: Teo Venier - http://code.google.com/p/jsdialogedit/
 *  Copyright (C) 2011-2014  Teo Venier
 *  
 *  This file is part of JSDialogEdit.
 *
 *  JSDialogEdit is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  JSDialogEdit is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with JSDialogEdit.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @file core.js
 * @project JSDialogEdit
 * IDE para cria&ccedil;&atilde;o de Caixas de Di&aacute;logo totalmente feito em JavaScript.
 * Permite rodar em modo offline ou online, salvando os arquivos em um servidor ou no pr&oacute;prio computador do usu&aacute;rio.
 * @author Teo Venier
 * @version 3.0.13
 */

/**
 * @struct {static} jsdeConfig
 * Permite personalizar as seguintes configuracoes do framework:
 * <ul>
 * <li>boolean <b>enableDrag</b> - Habilita/Desabilita arrastar os {@link JSDialogEdit.Componente} utilizando o mouse.</li>
 * <li>boolean <b>enableResize</b> - Habilita/Desabilita redimensionar os {@link JSDialogEdit.Componente}s utilizando o mouse.</li>
 * <li>String <b>pastaImagens</b> - Caminho relativo para a pasta onde se encontram as imagens para o editor.</li>
 * <li>int <b>scrollWidth</b> - Lagura da Barra de Rolagem em pixel, utilizado para corre&ccedil;&atilde;o de calculos internos.</li>
 * <li>int <b>trace</b> - Nivel de log gerado pelo trace do framework.</li>
 * </ul>
 */
 var jsdeConfig = jsdeConfig || {};

/** @class {static final class} JSDialogEdit
 * Pacote principal para o editor de caixas de di&aacute;logo, todas as outras classes est&atilde;o sob este
 * namespace para evitar conflito com o c&oacute;digo da p&aacute;gina onde o framework ser&aacute; utilizado.
 */
var JSDialogEdit = {
    /** @property {static String} version Vers&atilde;o do framework/editor. */
    version       : "JSDialogEdit v3.0.13",
    /** @property {static boolean} enableDrag Habilita/Desabilita arrastar os {@link JSDialogEdit.Componente} utilizando o mouse. */
    enableDrag    : jsdeConfig.enableDrag || true,
    /** @property {static boolean} dragging Flag indicando se algum {@link JSDialogEdit.Componente} est&aacute; sendo arrastado. */
    dragging      : false,
    /** @property {static boolean} dragged Flag indicando se algum {@link JSDialogEdit.Componente} foi arrastado. */
    dragged       : false,
    /** @property {static JSDialogEdit.Componente} dragComp Refer&ecirc;ncia ao {@link JSDialogEdit.Componente} que est&aacute; sendo arrastado. */
    dragComp      : null,
    /** @property {static int} dragGrade Tamanho da grade que o {@link JSDialogEdit.Componente} ficar&aacute; alinhado no modo de designer do Editor. */
    dragGrade     : 1,
    /** @property {static int} dragX Utilizado internamente para saber o quanto o {@link JSDialogEdit.Componente} foi arrastado na horizontal. */
    dragX         : 0,
    /** @property {static int} dragY Utilizado internamente para saber o quanto o {@link JSDialogEdit.Componente} foi arrastado na vertical. */
    dragY         : 0,
    /** @property {static boolean} enableResize Habilita/Desabilita redimensionar os {@link JSDialogEdit.Componente}s utilizando o mouse. */
    enableResize  : jsdeConfig.enableResize || true,
    /** @property {static JSDialogEdit.Componente} resizeComp Refer&ecirc;ncia ao {@link JSDialogEdit.Componente} que est&aacute; sendo redimensionado. */
    resizeComp    : null,
    /** @property {static boolean} resizing Flag indicando se algum {@link JSDialogEdit.Componente} est&aacute; sendo redimensionado. */
    resizing      : false,
    /** @property {static boolean} resized Flag indicando se algum {@link JSDialogEdit.Componente} foi redimensionado. */
    resized       : false,
    /** @property {static String} resizeDir Dire&ccedil;&atilde;o que o {@link JSDialogEdit.Componente} est&aacute; sendo redimensionado. */
    resizeDir     : "",
    /** @property {static int} resizeX Utilizado internamente para rastrear o deslocamento do mouse na horizontal. */
    resizeX       : 0,
    /** @property {static int} resizeY Utilizado internamente para rastrear o deslocamento do mouse na vertical. */
    resizeY       : 0,
    /** @property {static int} resizeW Utilizado internamente para saber o quanto a largura do {@link JSDialogEdit.Componente} foi redimensionada. */
    resizeW       : 0,
    /** @property {static int} resizeH Utilizado internamente para saber o quanto a altura do {@link JSDialogEdit.Componente} foi redimensionada. */
    resizeH       : 0,
    /** @property {static int} resizeWFactor Utilizado internamente para corrigir possivel erro de redimensionamento da largura. */
    resizeWFactor : 0,
    /** @property {static int} resizeHFactor Utilizado internamente para corrigir possivel erro de redimensionamento da altura. */
    resizeHFactor : 0,
    /** @property {static String} pastaImagens Caminho relativo para a pasta onde se encontram as imagens para o editor. */
    pastaImagens  : jsdeConfig.pastaImagens || "imagens/",
    /** @property {static int} scrollWidth Lagura da Barra de Rolagem em pixel, utilizado para corre&ccedil;&atilde;o de calculos internos. */
    scrollWidth   : jsdeConfig.scrollWidth || 18,
    /** @property {static int} trace Nivel de log gerado pelo trace do framework. Valores possiveis: 0..2 */
    trace         : jsdeConfig.trace || 0
};

/**
 * @function {static void} parseDialogURL
 * M&eacute;todo est&aacute;tico utilizado para carregar dinamicamente um c&oacute;digo atrav&eacute;s
 * da URL informada e ent&atilde;o criar o respectivo JSDialogEdit.Componente, o componete
 * criado &eacute; enviado como parametro para a fun&ccedil;&atilde;o de <i>callback</i> informada.
 * @param {JSONObject} parametros Objeto JSON com as informa&ccedil;&otilde;es para a requisi&ccedil;&atilde;o:
 * <ul>
 * <li><i>String</i> <b>url</b> : Endere&ccedil;o da URL para requisitar o c&oacute;digo a ser processado.</li>
 * <li><i>function</i> <b>metodo</b> : Fun&ccedil;&atilde;o JavaScript que ser&aacute; executada ap&oacute;s o retorno,
 * sem erro, da requisi&ccedil;&atilde;o. Recebe o JSDialogEdit.Componente processado como parametro.</li>
 * <li><i>function</i> <b>erro</b> : Fun&ccedil;&atilde;o JavaScript que ser&aacute; executada caso ocorra um erro na requisi&ccedil;&atilde;o.
 * Recebe o c&oacute;digo e descri&ccedil;&atilde;o do erro como parametro.</li>
 * </ul>
 */
JSDialogEdit.parseDialogURL = function ___jsdialogedit_parsedialogurl(parametros) {
    var j = new JSDialogEdit.Ajax();
    j.request({
        "url" : parametros.url,
        "metodo" : function ___jsdialogedit_parsedialogurl_callback(retorno) {
            var json, janela;
            
            try {
                json = JSON.parse(retorno);
                janela = JSDialogEdit.parseDialog(json);
                if (parametros.metodo) { parametros.metodo(janela); }
            } catch (e) {
                if (parametros.erro) { parametros.erro(e.message, e.name); }
            }
        },
        "erro" : parametros.erro
    });
};

/**
 * @function {static JSDialogEdit.Componente} parseDialog
 * M&eacute;todo est&aacute;tico utilizado para processar o c&oacute;digo gerado pelo Editor e retornar o respectivo JSDialogEdit.Componente.
 * @param {JSONObject} json Objeto JSON, gerado pelo Editor, a ser processado.
 */
JSDialogEdit.parseDialog = function ___jsdialogedit_parsedialog(json) {
    var nivel = arguments[1] || 0;
    
    try {
        window.setTimeout(function ___jsdialogedit_parsedialog_settimeout() {
            JSDialogEdit.Core.onParse(json.classe + "[#" + json.atributos.ID + "]");
        }, 10);
    } catch (e) {}
    
    var construtor = eval(json.classe);
    var elemento = new construtor(json.atributos);
    elemento.parseElemento();
    
    if (json.filhos) {
        for(var i = 0; i < json.filhos.length; i++) {
            var item = JSDialogEdit.parseDialog(json.filhos[i], nivel + 1);
            elemento.addFilho(item);
        }
    }
    
    if (nivel === 0 && elemento instanceof JSDialogEdit.Janela) {
        elemento.executar();
    } else if (elemento instanceof JSDialogEdit.Componente && elemento.getElemento() !== null && elemento.getElemento().style.position === "") {
        elemento.getElemento().style.position = "absolute";
    }
    
    return elemento;
};

/**
 * @class {static final class} JSDialogEdit.Core
 * Classe est&aacute;tica com fun&ccedil;&otilde;es b&aacute;sicas utilizadas pelo Editor e alguns Componentes.
 */
JSDialogEdit.Core = {
    /**
     * @function {static void} register
     * M&eacute;todo est&aacute;tico de apoio para registro de classes e cria&ccedil;&atilde;o de heran&ccedil;as.
     * @param {Object} filho Objeto filho a ser resgistrado.
     * @param {Object} pai Objeto pai a ser herdado.
     */
    register : function ___jsdialogedit_core_register(filho, pai) {
        if(JSDialogEdit.trace === 2) JSDialogEdit.Core.trace();
        
        filho.prototype = new pai();
        filho.prototype.constructor = filho;
        filho.prototype.superClass = pai;
    },

    /**
     * @function {static String} getBrowser
     * M&eacute;todo est&aacute;tico de apoio que retorna qual o navegador utilizado pelo usu&aacute;rio.<br />
     * CSS Browser Selector v0.2.5
     * @author Rafael Lima (http://rafael.adm.br)
     * @see http://rafael.adm.br/css_browser_selector
     * @return Nome e vers&atilde;o do navegador
     */
    getBrowser : function ___jsdialogedit_core_getbrowser() {
        if(JSDialogEdit.trace === 2) JSDialogEdit.Core.trace();
        
        var
            ua=navigator.userAgent.toLowerCase(),
            is=function(t){return ua.indexOf(t) != -1;},
            b=(!(/opera|webtv/i.test(ua))&&/msie ([\d.]+)/.test(ua)) ? ("ie" + RegExp.$1) :
              is("Trident/") ? "ie11" :
              is("gecko/") ? "gecko" :
              is("opera/9") ? "opera9" : /opera (\d)/.test(ua) ? "opera" + RegExp.$1 :
              is("konqueror") ? "konqueror" :
              is("chrome/") ? "chrome" :
              is("applewebkit/") ? "safari" :
              is("mozilla/") ? "gecko" : "",
            os=(is("x11")||is("linux")) ? " linux" : is("mac") ? " mac" : is("win") ? " win" : "";
        return b + " " + os;
    },

    /**
     * @function {static void} disableSelection
     * M&eacute;todo est&aacute;tico de apoio que permite desabilitar a funcionalidade do usu&aacute;rio selecionar um trecho de texto da p&aacute;gina.
     * @author Bret Taylor (http://finiteloop.org/~btaylor/)
     * @see http://ajaxcookbook.org/disable-text-selection
     * @param {DOM.HTMLElement} element Elemento a ser desabilitado.
     */
    disableSelection : function ___jsdialogedit_core_disableselection(element) {
        if(JSDialogEdit.trace === 2) JSDialogEdit.Core.trace();
        
        element.onselectstart = function ___jsdialogedit_core_disableselection_onselectstart() {return false;};
        element.unselectable = "on";
        element.style.MozUserSelect = "-moz-none";
        element.style.WebkitUserSelect = "none";
        element.style.userSelect = "none";
        element.style.cursor = "default";
    },

    /**
     * @function {static void} enableSelection
     * M&eacute;todo est&aacute;tico de apoio que permite reabilitar a funcionalidade do usu&aacute;rio selecionar um trecho de texto da p&aacute;gina
     * @param {DOM.HTMLElement} element Elemento a ser desabilitado.
     */
    enableSelection : function ___jsdialogedit_core_enableselection(element) {
        if(JSDialogEdit.trace === 2) JSDialogEdit.Core.trace();
        
        element.onselectstart = function ___jsdialogedit_core_enableselection_onselectstart(e) {
            e = e || event;
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            return true;
        };
        element.unselectable = "off";
        element.style.MozUserSelect = "text";
        element.style.WebkitUserSelect = "text";
        element.style.userSelect = "text";
        element.style.cursor = "auto";
    },

    /**
     * @function {static void} capturaEvento
     * M&eacute;todo est&aacute;tico de apoio que permite adicionar uma fun&ccedil;&atilde;o que processa os eventos ocorridos em qualquer objeto DOM.HTMLElement.
     * @param {DOM.HTMLElement} obj Objeto onde o evento dever&aacute; ser capturado.
     * @param {String} evt Nome do evento que deve ser observado.
     * @param {Function} fnc Fun&ccedil;&atilde;o a ser disparada quando o evento ocorrer.
     */
    capturaEvento : function ___jsdialogedit_core_capturaevento(obj, evt, fnc) {
        if(JSDialogEdit.trace === 2) JSDialogEdit.Core.trace();
        
        if (obj.addEventListener) {
            obj.addEventListener(evt, fnc, false);
        } else if (obj.attachEvent) {
            obj.attachEvent("on" + evt, function ___jsdialogedit_core_capturaevento_attachevent() {fnc.call(obj);});
        }
    },
    
    /**
     * @function {static void} removeEvento
     * M&eacute;todo est&aacute;tico de apoio que retira uma fun&ccedil;&atilde;o que processa os eventos ocorridos em qualquer objeto DOM.HTMLElement.
     * @param {DOM.HTMLElement} obj Objeto onde o evento ser&aacute; executado.
     * @param {String} evt Nome do evento que ira disparar a fun&ccedil;&atilde;o.
     * @param {Function} fnc Fun&ccedil;&atilde;o a ser disparada.
     * @draft Ainda n&atilde;o trabalha com Internet Explorer.
     * @deprecated Necessita de um melhor tratamento para o registro e desregistro dos Listener.
     */
    removeEvento : function ___jsdialogedit_core_removeevento(obj, evt, fnc) {
        if (obj.removeEventListener) {
            obj.removeEventListener(evt, fnc, false);
        }
    },

    /**
     * @function {static void} startDrag
     * M&eacute;todo est&aacute;tico de apoio que permite mover um JSDialogEdit.Componente ou mesmo um DOM.HTMLElement pela tela.
     * @param {Event} e Evento disparado pelo navegador.
     */
    startDrag : function ___jsdialogedit_core_startdrag(e) {
        if(JSDialogEdit.trace === 2) JSDialogEdit.Core.trace();
        
        if (!JSDialogEdit.dragComp) return;
        e = e ? e : event;
        
        if (!(JSDialogEdit.dragComp instanceof JSDialogEdit.Objeto) &&
             (JSDialogEdit.dragComp.style.position !== "absolute" ||
              JSDialogEdit.dragComp.style.position !== "fixed")) JSDialogEdit.dragComp.style.position = "absolute";
        
        if (JSDialogEdit.dragComp instanceof JSDialogEdit.Objeto) {
            if (!JSDialogEdit.dragComp.getArrastavel()) return;
            JSDialogEdit.dragX = e.clientX - JSDialogEdit.dragComp.getElemento().offsetLeft;
            JSDialogEdit.dragY = e.clientY - JSDialogEdit.dragComp.getElemento().offsetTop;
        } else {
            JSDialogEdit.dragX = e.clientX - JSDialogEdit.dragComp.offsetLeft;
            JSDialogEdit.dragY = e.clientY - JSDialogEdit.dragComp.offsetTop;
        }
        
        JSDialogEdit.dragging = true;
    },

    /**
     * @function {static void} runDrag
     * M&eacute;todo est&aacute;tico de apoio que move um JSDialogEdit.Componente ou mesmo um DOM.HTMLElement pela tela.
     * @param {Event} e Evento disparado pelo navegador.
     */
    runDrag : function ___jsdialogedit_core_runDrag(e) {
        if (!JSDialogEdit.dragging) return;
        if (!JSDialogEdit.dragComp) return;
        
        e = e ? e : event;
        var x = e.clientX - JSDialogEdit.dragX,
            y = e.clientY - JSDialogEdit.dragY;
        
        if (!JSDialogEdit.dragged) try { JSDialogEdit.Core.onBeforeDrag.call(JSDialogEdit.dragComp, e); } catch (ee) { }
        
        if (JSDialogEdit.dragComp instanceof JSDialogEdit.Objeto) {
            if (JSDialogEdit.dragComp.dragAxy.indexOf("x") > -1) JSDialogEdit.dragComp.setEsquerda(x);
            if (JSDialogEdit.dragComp.dragAxy.indexOf("y") > -1) JSDialogEdit.dragComp.setSuperior(y);
            JSDialogEdit.dragComp.getElemento().style.opacity = 0.75;
        } else {
            if (JSDialogEdit.dragComp.dragAxy !== undefined) {
                if (JSDialogEdit.dragComp.dragAxy.indexOf("x") > -1) JSDialogEdit.dragComp.style.left = x + "px";
                if (JSDialogEdit.dragComp.dragAxy.indexOf("y") > -1) JSDialogEdit.dragComp.style.top = y + "px";
            } else {
                JSDialogEdit.dragComp.style.left = x + "px";
                JSDialogEdit.dragComp.style.top = y + "px";
            }
            JSDialogEdit.dragComp.style.opacity = 0.75;
        }
        
        JSDialogEdit.resizing = false;
        JSDialogEdit.dragged = true;
        JSDialogEdit.Core.onDrag.call(JSDialogEdit.dragComp, e, x, y);
    },

    /**
     * @function {static void} endDrag
     * M&eacute;todo est&aacute;tico de apoio relacionado ao movimento de um JSDialogEdit.Componente ou mesmo um DOM.HTMLElement pela tela.
     */
    endDrag : function ___jsdialogedit_core_endDrag() {
        if (JSDialogEdit.dragged) {
            try { JSDialogEdit.Core.onAfterDrag.call(JSDialogEdit.dragComp); } catch(ee) { }
        }
        if (JSDialogEdit.dragComp instanceof JSDialogEdit.Objeto) {
            if (JSDialogEdit.dragging) JSDialogEdit.dragComp.getElemento().style.opacity = "";
        } else {
            if (JSDialogEdit.dragging) JSDialogEdit.dragComp.style.opacity = "";
        }
        JSDialogEdit.dragging = false;
        JSDialogEdit.dragged = false;
        JSDialogEdit.dragComp = null;
        JSDialogEdit.dragGrade = 1;
    },

    /**
     * @function {static void} initDrag
     * M&eacute;todo est&aacute;tico de apoio relacionado ao movimento de um JSDialogEdit.Componente ou mesmo um DOM.HTMLElement pela tela.
     */
    initDrag : function ___jsdialogedit_core_initDrag() {
        JSDialogEdit.Core.capturaEvento(document.body, "mousedown", JSDialogEdit.Core.startDrag);
        JSDialogEdit.Core.capturaEvento(document.body, "mousemove", JSDialogEdit.Core.runDrag);
        JSDialogEdit.Core.capturaEvento(document.body, "mouseup", JSDialogEdit.Core.endDrag);
    },

    /**
     * @function {static void} startResize
     * M&eacute;todo est&aacute;tico de apoio relacionado ao redimencionamento de um JSDialogEdit.Componente ou mesmo um DOM.HTMLElement pela tela.
     * @param {Event} e Evento disparado pelo navegador.
     */
    startResize : function ___jsdialogedit_core_startResize(e) {
        if (!JSDialogEdit.resizeComp) return;
        if (JSDialogEdit.resizeComp instanceof JSDialogEdit.Objeto && !JSDialogEdit.resizeComp.getRedimensionavel()) return;
        e = e || event;
        
        JSDialogEdit.resizeX = e.clientX;
        JSDialogEdit.resizeY = e.clientY;
        JSDialogEdit.resizing = true;
        document.body.style.cursor = JSDialogEdit.resizeDir + "-resize";
        
        if (!(JSDialogEdit.resizeComp instanceof JSDialogEdit.Objeto)) {
            var w = JSDialogEdit.resizeComp.clientWidth;
            JSDialogEdit.resizeComp.style.width = w + "px";
            JSDialogEdit.resizeWFactor = JSDialogEdit.resizeComp.clientWidth - w;
            JSDialogEdit.resizeComp.style.width = (w - JSDialogEdit.resizeWFactor) + "px";
            
            var h = JSDialogEdit.resizeComp.clientHeight;
            JSDialogEdit.resizeComp.style.height = h + "px";
            JSDialogEdit.resizeHFactor = JSDialogEdit.resizeComp.clientHeight - h;
            JSDialogEdit.resizeComp.style.height = (h - JSDialogEdit.resizeHFactor) + "px";
        }
    },

    /**
     * @function {static void} runResize
     * M&eacute;todo est&aacute;tico que redimenciona um JSDialogEdit.Componente ou mesmo um DOM.HTMLElement pela tela.
     * @param {Event} e Evento disparado pelo navegador.
     */
    runResize : function ___jsdialogedit_core_runResize(e) {
        e = e || event;
        var target = e.target || e.srcElement;
        if (!JSDialogEdit.resizing && !/jsdeResize/i.test(target.className)) return;
        
        var x = e.clientX,
            y = e.clientY,
            orientacao = "",
            dx = 0,
            dy = 0,
            minLar = 5,
            minAlt = 5,
            borda_margem = 7,
            borda_esquerda, borda_superior, borda_direita, borda_inferior,
            computedW, computedH, lar, alt, JSDEComponente, resizeAxy;
        
        
        if (!JSDialogEdit.resizing) {
            borda_esquerda = target.getBoundingClientRect().left;
            borda_superior = target.getBoundingClientRect().top;
            borda_direita  = target.getBoundingClientRect().right;
            borda_inferior = target.getBoundingClientRect().bottom;
            
            target.style.cursor = "";
            
            if (y >= borda_inferior - borda_margem && y <= borda_inferior) orientacao = "s";
            if (x >= borda_direita - borda_margem && x <= borda_direita) orientacao += "e";
            if (orientacao !== "") target.style.cursor = orientacao + "-resize";
            
            JSDialogEdit.resizeDir = orientacao;
        } else {
            if(!JSDialogEdit.resized) {
                try { JSDialogEdit.Core.onBeforeResize.call(JSDialogEdit.resizeComp, e); } catch (ee) { }
            }
            
            JSDEComponente = JSDialogEdit.resizeComp instanceof JSDialogEdit.Objeto;
            resizeAxy = JSDEComponente ? JSDialogEdit.resizeComp.resizeAxy : "xy";
            target = JSDEComponente ? JSDialogEdit.resizeComp.getElemento() : JSDialogEdit.resizeComp;
        
            computedW = parseInt(JSDialogEdit.Core.getEstilo(target, "minWidth"), 10) || 0;
            computedH = parseInt(JSDialogEdit.Core.getEstilo(target, "minHeight"), 10) || 0;

            if (JSDEComponente) {
                minLar = JSDialogEdit.resizeComp.larguraMin;
                minAlt = JSDialogEdit.resizeComp.alturaMin;
            }else {
                minLar = (computedW !== 0 ? computedW : minLar),
                minAlt = (computedH !== 0 ? computedH : minAlt);
            }
            
            lar = JSDEComponente ? JSDialogEdit.resizeComp.getLargura() : JSDialogEdit.resizeComp.clientWidth;
            lar = lar === "" ? 0 : parseInt(lar, 10);
            alt = JSDEComponente ? JSDialogEdit.resizeComp.getAltura() : JSDialogEdit.resizeComp.clientHeight;
            alt = alt === "" ? 0 : parseInt(alt, 10);
            
            if (resizeAxy.indexOf("x") != -1 && JSDialogEdit.resizeDir.indexOf("e") != -1) {
                dx = x - JSDialogEdit.resizeX;
            }
            
            if (resizeAxy.indexOf("y") != -1 && JSDialogEdit.resizeDir.indexOf("s") != -1) {
                dy = y - JSDialogEdit.resizeY;
            }
            
            if (x !== 0 && y !== 0) {
                if (dx !== 0 && lar + dx >= minLar) {
                    JSDEComponente ?
                        JSDialogEdit.resizeComp.setLargura(lar + dx) :
                        JSDialogEdit.resizeComp.style.width = (lar + dx - JSDialogEdit.resizeWFactor) + "px";
                    JSDialogEdit.resizeX = e.clientX;
                }
                if (dy !== 0 && alt + dy >= minAlt) {
                    JSDEComponente ?
                        JSDialogEdit.resizeComp.setAltura(alt + dy) :
                        JSDialogEdit.resizeComp.style.height = (alt + dy - JSDialogEdit.resizeHFactor) + "px";
                    JSDialogEdit.resizeY = e.clientY;
                }
            }
        
            JSDialogEdit.resized = true;
            try { JSDialogEdit.Core.onResize.call(JSDialogEdit.resizeComp, e); } catch (ee) { }
        }
    },

    /**
     * @function {static void} endResize
     * M&eacute;todo est&aacute;tico de apoio relacionado ao redimencionamento de um
     * JSDialogEdit.Componente ou mesmo um DOM.HTMLElement pela tela.
     */
    endResize : function ___jsdialogedit_core_endResize(e) {
        e = e || event;
        if (JSDialogEdit.resizing) {
            document.body.style.cursor = "auto";
        }
        if (JSDialogEdit.resized) {
            try {
                JSDialogEdit.Core.onAfterResize.call(JSDialogEdit.resizeComp, e);
                if(JSDialogEdit.resizeComp.onResize) JSDialogEdit.resizeComp.onResize.call(JSDialogEdit.resizeComp, e);
            } finally {
                JSDialogEdit.resizing = false;
                JSDialogEdit.resized = false;
                JSDialogEdit.resizeComp = null;
                JSDialogEdit.resizeDir = "";
            }
        } else {
            JSDialogEdit.resizing = false;
            JSDialogEdit.resized = false;
            JSDialogEdit.resizeComp = null;
            JSDialogEdit.resizeDir = "";
        }
    },

    /**
     * @function {static void} initResize
     * M&eacute;todo est&aacute;tico que inicializa o evento de redimencionar um {@link JSDialogEdit.Componente}.
     */
    initResize : function ___jsdialogedit_core_initResize() {
        JSDialogEdit.Core.capturaEvento(document.body, "mousedown", JSDialogEdit.Core.startResize);
        JSDialogEdit.Core.capturaEvento(document.body, "mousemove", JSDialogEdit.Core.runResize);
        JSDialogEdit.Core.capturaEvento(document.body, "mouseup", JSDialogEdit.Core.endResize);
    },

    /**
     * @function {static void} initEventos
     * M&eacute;todo est&aacute;tico que inicializa o controle de eventos do editor, como por exemplo, arrastar/redimencionar uma janela.
     */
    initEventos : function ___jsdialogedit_core_initEventos() {
        if(JSDialogEdit.trace === 1) JSDialogEdit.Core.trace();
        
        var x, temp, lstElementos = [];
        document.body.style.height = "100%";
        document.getElementsByTagName("html")[0].style.height = "100%";
        
        if (document.all) {
            for(x = 0; x < document.all.length; x++) {
                lstElementos.push(document.all[x]);
            }
        } else {
            temp = document.getElementsByTagName("body")[0].getElementsByTagName("*");
            for(x = 0; x < temp.length; x++) {
                lstElementos.push(temp[x]);
            }
        }
        
        var tmp1 = function (e) {
            JSDialogEdit.resizeComp = this;
        };
        var tmp2 = function (e) {
            e = e || event;
            var _target = e.target ? e.target : e.srcElement;
            if (_target != this) return;
            JSDialogEdit.dragComp = this;
        };
        
        for(x = 0; x < lstElementos.length; x++) {
            if (lstElementos[x].className.indexOf("jsdeResize") != -1) {
                JSDialogEdit.Core.capturaEvento(lstElementos[x], "mousedown", tmp1);
            }
            
            if (lstElementos[x].className.indexOf("jsdeDrag") != -1) {
                JSDialogEdit.Core.capturaEvento(lstElementos[x], "mousedown", tmp2);
            }
        }
        
        if (JSDialogEdit.enableDrag) JSDialogEdit.Core.initDrag();
        if (JSDialogEdit.enableResize) JSDialogEdit.Core.initResize();
    },
    
    /**
     * @function {static void} setEstilo
     * Define o CSS que ser&aacute; utilizado pelos {@link JSDialogEdit.Componente}
     * @param {String} estilo Nome do tema a ser utilizado
     * @deprecated
     */
    setEstilo : function ___jsdialogedit_core_setestilo(estilo) {
        var i, link_tag;
        link_tag = document.getElementsByTagName("link");
        for(i = 0; i < link_tag.length; i++) {
            if ((link_tag[i].rel.indexOf("stylesheet") != -1) && link_tag[i].title) {
                link_tag[i].disabled = link_tag[i].title != estilo;
            }
        }
    },
    
    /**
     * @function {static String} getEstilo
     * Retorna o valor do estilo aplicado ao elemento, independente se foi aplicado
     * por arquivo CSS externo, diretamente no HTML do elemento ou por c&oacute;digo em JavaScript.
     * @param {HTMLElement} elemento Elemento a ser analizado.
     * @param {String} estilo Nome do estilo a ser pesquisado, no formato JavaScript, exemplo: <i>borderWidth</i>.
     * @return Valor do estilo atualmente aplicado ao Elemento, idependente
     * da origem e mesmo se foi sobrescrito por outro CSS com maior prioridade.
     */
    getEstilo : function ___jsdialogedit_core_getEstilo(elemento, estilo) {
        var ret = "";
        if ("getComputedStyle" in window) {
            ret = getComputedStyle(elemento)[estilo];
        } else {
            ret = elemento.currentStyle[estilo];
        }
        return ret;
    },
    
    /**
     * @event {static delegate Function} onBeforeResize
     * Define a fun&ccedil;&atilde;o a ser executada antes de um {@link JSDialogEdit.Componente} ser redimensionado.
     */
    onBeforeResize : function ___jsdialogedit_core_onBeforeResize() {},
    
    /**
     * @event {static delegate Function} onResize
     * Define a fun&ccedil;&atilde;o a ser executada quando um {@link JSDialogEdit.Componente} for redimensionado.
     * @param {Event} e Evento do MouseMove que disparou o metodo.
     */
    onResize : function ___jsdialogedit_core_onResize(e) {},
    
    /**
     * @event {static delegate Function} onAfterResize
     * Define a fun&ccedil;&atilde;o a ser executada apos um {@link JSDialogEdit.Componente} ser redimensionado.
     */
    onAfterResize : function ___jsdialogedit_core_onAfterResize() {},
    
    /**
     * @event {static delegate Function} onBeforeDrag
     * Define a fun&ccedil;&atilde;o a ser executada antes de um {@link JSDialogEdit.Componente} for arrastado.
     * @param {Event} e Evento do MouseMove que disparou o metodo.
     */
    onBeforeDrag : function ___jsdialogedit_core_onBeforeDrag(e) {},
    
    /**
     * @event {static delegate Function} onDrag
     * Define a fun&ccedil;&atilde;o a ser executada quando um {@link JSDialogEdit.Componente} for arrastado.
     * @param {Event} e Evento do MouseMove que disparou o metodo.
     * @param {int} x Posi&ccedil;&atilde;o X para onde o Componente foi arrastado.
     * @param {int} y Posi&ccedil;&atilde;o Y para onde o Componente foi arrastado.
     */
    onDrag : function ___jsdialogedit_core_onDrag(e) {},
    
    /**
     * @event {static delegate Function} onAfterDrag
     * Define a fun&ccedil;&atilde;o a ser executada apos um {@link JSDialogEdit.Componente} ser arrastado.
     */
    onAfterDrag : function ___jsdialogedit_core_onAfterDrag() {},
    
    /**
     * @event {static delegate Function} onParse
     * Define a fun&ccedil;&atilde;o a ser executada apos o processamento do c&oacute;digo pelo {@link parseDialog} ou {@link parseDialogURL}.
     * @param {JSDialogEdit.Componente} componente Componente que acabou de ser processado.
     */
    onParse : function ___jsdialogedit_core_onParse(componente) {},
    
    /**
     * @function {static void} trace
     * Gera log de acordo com a defini&ccedil;&atilde;o de nivel de detalhamento do JSDE.
     */
    trace : function () { },
    __trace : function ___jsdialogedit_core_trace() {
        var pai, texto, div, txt;
        pai = arguments.callee.caller;
        texto = pai.name;
        
        pai = pai.arguments.callee.caller;
        while(pai) {
            texto = pai.name + " -> " + texto;
            pai = pai.arguments.callee.caller;
        }
        
        texto = texto + "(";
        for(var x = 0; x < arguments.callee.caller.arguments.length; x++) {
            if(typeof arguments.callee.caller.arguments[x] === "string") {
                texto = texto + " '" + arguments.callee.caller.arguments[x] + "'";
            } else if(typeof arguments.callee.caller.arguments[x] === "boolean") {
                texto = texto + arguments.callee.caller.arguments[x];
            } else {
                texto = texto + " " + (typeof arguments.callee.caller.arguments[x]);
            }
        }
        texto = texto + ")";
        
        if(typeof window.console === "undefined") {
            div = document.getElementById("jsdeDivLog");
            if(!div) {
                div = document.createElement("div");
                div.id = "jsdeDivLog";
                document.body.appendChild(div);
            }

            txt = document.createElement("div");
            txt.innerHTML = texto;
            div.appendChild(txt);
        } else {
            console.log(texto);
        }
    },

    larguraTexto : function ___jsdialogedit_core_larguraTexto(elemento) {
        var largura = 0;
        var holder = document.createElement("div");
        holder.id = "jsdeTexto_" + (new Date().getTime());
        
        holder.style.position = "absolute";
        holder.style.top = "-1000px";
        holder.style.left = "-1000px";
        holder.style.whiteSpace = "nowrap";
        holder.style.fontFamily = JSDialogEdit.Core.getEstilo(elemento, "fontFamily");
        holder.style.fontSize = JSDialogEdit.Core.getEstilo(elemento, "fontSize");
        holder.style.fontWeight = JSDialogEdit.Core.getEstilo(elemento, "fontWeight");
        holder.style.fontStyle = JSDialogEdit.Core.getEstilo(elemento, "fontStyle");
        holder.style.wordSpacing = JSDialogEdit.Core.getEstilo(elemento, "wordSpacing");
        holder.style.paddingTop = JSDialogEdit.Core.getEstilo(elemento, "paddingTop");
        holder.style.paddingRight = JSDialogEdit.Core.getEstilo(elemento, "paddingRight");
        holder.style.paddingBottom = JSDialogEdit.Core.getEstilo(elemento, "paddingBottom");
        holder.style.paddingLeft = JSDialogEdit.Core.getEstilo(elemento, "paddingLeft");
        
        holder.textContent = elemento.textContent;
        document.body.appendChild(holder);
        
        largura = holder.clientWidth;
        document.body.removeChild(holder);
        return largura;
    }
};

// chamando a inicializacao dos eventos da framework
JSDialogEdit.Core.capturaEvento(window, "load", JSDialogEdit.Core.initEventos);

/**
 * @class {class} JSDialogEdit.Propriedade
 * Objeto representando as propriedades dispon&iacute;veis para cada Componente no Inspetor durante a edi&ccedil;&atilde;o no Editor.
 * @constructor JSDialogEdit.Propriedade Cria uma nova propriedade.
 * @param {JSONObject} prop JSONObject an&ocirc;nimo com as informa&ccedil;&otilde;es necess&aacute;rias para a
 * cria&ccedil;&atilde;o de uma Propriedade, os atributos utilizados devem fazer refer&ecirc;ncia
 * as pr&oacute;prias propriedades do objeto JSDialogEdit.Propriedade:
 * <ul>
 * <li><b>nome</b> : Nome da propriedade a ser exibido no Inspetor.</li>
 * <li><b>descricao/b> : Texto explicativo da propriedade.</li>
 * <li><b>tipo</b> : Define a forma como a propriedade ser&aacute; tratada pelo Inspector,
 * as formas disponiveis estao definidas em {@link JSDialogEdit.Propriedade.Tipos}.</li>
 * <li><b>get</b> : Nome da fun&ccedil;&atilde;o a ser executada para o Inspetor recuperar o valor da propriedade.</li>
 * <li><b>set</b> : Nome da fun&ccedil;&atilde;o a ser executada para o Inspetor definir o valor da propriedade.</li>
 * <li><b>html</b> : N&Atilde;O UTILIZADO.</li>
 * <li><b>opcoes</b> :
 * <li><b>funcao</b> : 
 * <li><b>habilitado</b> : 
 * </ul>
*/
JSDialogEdit.Propriedade = function (prop) {
    if(JSDialogEdit.trace === 2) JSDialogEdit.Core.trace();
    
    if (!(prop instanceof Object) || prop instanceof Array) throw "JSDialogEdit.Propriedade: InvalidPropriedadeException";

    /** @property {String} nome Nome da propriedade, ser&aacute; exibida na janela do Inspector. */
    this.nome = prop.nome;
    /** @property {String} descricao Descri&ccedil;&atilde;o para a propriedade, ser&aacute; utilizado como tooltip na janela do Inspector. */
    this.descricao = prop.descricao;
    /** @property {JSDialogEdit.Propriedade.Tipos} tipo Tipo da propriedade, definir&aacute; como o Inspector trabalhar&aacute; com a propriedade. */
    this.tipo = prop.tipo;
    /** @property {String} get Nome da fun&ccedil;&atilde;o a ser executada para o Inspector recuperar o valor da propriedade. */
    this.get = prop.get;
    /** @property {String} get Nome da fun&ccedil;&atilde;o a ser executada para o Inspector definir o valor da propriedade. */
    this.set = prop.set;
    /** @property {String} html N&atilde;o utilizado. */
    this.html = prop.html;
    /** @property {JSONObject} opcoes Objeto JSON do tipo {Chave:Valor} com as op&ccedil;&otilde;es disponiveis para sele&ccedil;&atilde;o no Inspector. */
    this.opcoes = prop.opcoes;
    /** @property {Function} funcao Fun&ccedil;&atilde;o a ser executada para retornar um JSONObject
     *  com as op&ccedil;&otilde;es disponiveis para sele&ccedil;&atilde;o no Inspector.
     */
    this.funcao = prop.funcao;
    /** @property {boolean} habilitado Flag indicando se a Propriedade est&aacute; ou n&atilde;o habilitada. */
    this.habilitado = prop.habilitado;
    /** @property {boolean} readonly Flag indicando se a Propriedade pode ou n&atilde;o ser alterada. */
    this.readonly = prop.readonly;
    /** @property {Function} editor Indica um editor que o Inspector deve utilizar para a editar o valor da Propriedade. */
    this.editor = prop.editor;
    /** @property {boolean} refresh Indica ao editor para recarregar a arvore de componentes. */
    this.refresh = prop.refresh;
    /** @property {String} retorno Tipo de retorno para Propriedades do Tipo Funcao. */
    this.retorno = prop.retorno;
    /** @property {String} parametros Parametros recebidos pela fun&ccedil;&atilde;o para Propriedades do Tipo Funcao. */
    this.parametros = prop.parametros;
};

/** @struct {static final} Tipos
 * Lista de tipos dispon&iacute;veis para uma JSDialogEdit.Propriedade.<br>
 * Segue abaixo as op&ccedil;&otilde;es dispon&iacute;veis:
 * <ul>
 * <li> <b>Valor</b> - tipos prim&aacute;rios como int, string, char. N&Atilde;O INCLUI BOOLEAN. Exemplo: <i>ID</i>
 * <li> <b>Funcao</b> - propriedades que armazenam c&oacute;digo fonte de fun&ccedil;&otilde;es: function () {...}. Exemplo: <i>OnClick</i>
 * <li> <b>Objeto</b> - utilizado para definir uma lista de pares nome/valor: {nome:valor,...}. Exemplo: <i>Estilos</i>
 * <li> <b>Boolean</b> - valores l&oacute;gicos booleano: true/false. Exemplo: <i>Visivel</i>
 * <li> <b>Lista</b> - exibe uma lista de op&ccedil;&otilde;es padr&atilde;o para o usu&aacute;rio escolher uma. Exemplo: <i>Tipo de Janela</i> <br />
 * As op&ccedil;&otilde;es devem ser passadas no atributo Opcoes do objeto {@link JSDialogEdit.Propriedade}
 * <li> <b>ListaFuncao</b> - Mesmo que Lista porem as op&ccedil;&otilde;es s&atilde;o rebecebidas atrav&eacute;s de uma fun&ccedil;&atilde;o.
 * Exemplo: <i>Referencia do Rotulo</i> <br />
 * A fun&ccedi;&atilde;o que retorna a lista deve ser passada no atributo Funcao do objeto {@link JSDialogEdit.Propriedade}
 * <li> <b>Acao</b> - permite executar a&ccedil;&otilde;es/fun&ccedil;&otilde;es atrav&eacute;s do Inspector. Exemplo: <i>Dados do Conector</i> <br />
 * A a&ccedil;&atilde;o a ser executada deve ser passada no atributo Funcao do objeto {@link JSDialogEdit.Propriedade}
 * </ul>
 */
JSDialogEdit.Propriedade.Tipos = {
    /** @property {static final String} Valor
     * Indica que a Propriedade &eacute; do tipo String e ser&aacute; editada usando uma Caixa de Texto.
     */
    Valor : "valor",
    /** @property {static final String} Funcao
     * Indica que a Propriedade &eacute; do tipo Function e ser&aacute; editada usando o Editor de Fun&ccedil;&otilde;es.
     */
    Funcao : "funcao",
    /** @property {static final String} Objeto
     * Indica que a Propriedade &eacute; do tipo Object e ser&aacute; editada usando o Editor de Objetos.
     */
    Objeto : "objeto",
    /** @property {static final String} Boolean
     * Indica que a Propriedade &eacute; do tipo boolean e ser&aacute; editada usando um campo Checkbox.
     */
    Boolean     : "booleano",
    /** @property {static final String} Lista
     * Indica que a Propriedade &eacute; do tipo String e ser&aacute; editada usando um campo
     * DropDown vindo da propriedade {@link JSDialogEdit.Propriedade.opcoes}.
     */
    Lista : "lista",
    /** @property {static final String} ListaFuncao
     * Indica que a Propriedade &eacute; do tipo String e ser&aacute; editada usando uma campo
     * DropDown vindo da propriedade {@link JSDialogEdit.Propriedade.funcao}.
     */
    ListaFuncao : "listafuncao",
    /** @property {static final String} Acao
     * Indica que a Propriedade n&atilde;o &eacute; editavel, deve executar a fun&ccedil;&atilde;o
     * informada na propriedade {@link JSDialogEdit.Propriedade.funcao}.
     */
    Acao : "acao",
    /** @property {static final String} Editor
     * Indica que a Propriedade deve ser editada usando um editor especifico.
     */
    Editor : "editor",
    /** @property {static final String} Numero
     * Indica que a Propriedade &eacute; do tipo Numero n&atilde;o permitindo a entrada de texto.
     */
    Numero : "numero"
};

/**
 * @class {class} JSDialogEdit.Objeto
 * Objeto raiz que todas as classes herdam.<br>
 * Possui as propriedades e metodos b&aacute;sicos que qualquer Componente precisa.
 * @contructor JSDialogEdit.Objeto Cria um novo Objeto
 */
JSDialogEdit.Objeto = function () {
    var id = null,
        self = this,
        propriedades = [],
        eventos = [];
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto. */
    this.CLASSE = "JSDialogEdit.Objeto";
    
    /**
     * @function {String} get
     * Retorna o valor de uma Propriedade
     * @param {String} nome Nome da Propriedade a ser pesquisada
     * @return Valor definido para a propridade
     */
    this.get = function ___jsdialogedit_objeto_get(nome) {
        var prop = this.getPropriedade(nome);
        if (prop) {
            return this[prop.get]();
        }
        return null;
        //throw "JSDialogEdit.Objeto: InvalidPropriedadeException";
    };
    /**
     * @function {void} set
     * Define o valor de uma Propriedade
     * @param {String} nome Nome da Propriedade a ser pesquisada
     * @param {String} valor Valor a ser definido para a Propriedade
     */
    this.set = function ___jsdialogedit_objeto_set(nome,valor) {
        var prop = this.getPropriedade(nome);
        if (prop) {
            this[prop.set](valor);
        } else {
            prop = this.getEvento(nome);
            if (prop) {
                this[prop.set](valor);
            }
        }
    };
    /**
     * @function {String} getId
     * Retorna o valor do IDentificador do componente utilizado para identificar de forma unica o componente na pagima HTML.
     * @return Valor da propriedade ID do componente e do elemento HTML na p&aacute;gina
     */
    this.getId = function ___jsdialogedit_objeto_getid() {return id;};
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function ___jsdialogedit_objeto_setid(v) {if (v !== "") id = v;};
    /**
     * @function {Array} getPropriedades
     * Retorna uma lista com todas as propriedades do objeto
     * @return Array com as propriedades
     */
    this.getPropriedades = function ___jsdialogedit_objeto_getPropriedades() {return propriedades;};
    /**
     * @function {JSDialogEdit.Propriedade} getPropriedade
     * Retorna uma propriedade especifica do objeto
     * @param {String} p Nome da propriedade a ser retornada
     * @return Retorna a propriedade solicitada
     */
    this.getPropriedade = function ___jsdialogedit_objeto_getPropriedade(p) {
        for(var i = 0; i < propriedades.length; i++) {
            if (propriedades[i].nome === p) return propriedades[i];
        }
        
        return null;
    };
    /**
     * @function {void} addPropriedade
     * Adiciona uma propriedade ao objeto.
     * @throws InvalidPropriedadeException
     * @param {JSDialogEdit.Propriedade} p Propriedade a ser adicionada.
     */
    this.addPropriedade = function ___jsdialogedit_objeto_addPropriedade(p) {
        if (p instanceof  JSDialogEdit.Propriedade) {
            propriedades.push(p);
        } else {
            throw "JSDialogEdit.Objeto: InvalidPropriedadeException";
        }
    };
    /**
     * @function {void} removePropriedade
     * Remove uma propriedade do objeto
     * @param {String} nome Nome da propriedade a ser removida
     */
    this.removePropriedade = function ___jsdialogedit_objeto_removePropriedade(nome) {
        var achei = false;
        for(var i = 0; i < propriedades.length; i++) {
            if (achei) propriedades[i-1] = propriedades[i];
            if (propriedades[i].nome === nome) achei = true;
        }
        if (achei) propriedades.pop();
    };
    /**
     * @function {Array} getEventos
     * Retorna uma lista com todos os eventos do objeto
     * @return Array com os eventos
     */
    this.getEventos = function ___jsdialogedit_objeto_getEventos() {return eventos;};
    /**
     * @function {JSDialogEdit.Propriedade} getEvento
     * Retorna uma propriedade do tipo evento especifico do objeto
     * @param {String} p Nome do evento a ser retornado
     * @return Retorna a propriedade solicitada
     */
    this.getEvento = function ___jsdialogedit_objeto_getEvento(p) {
        for(var i = 0; i < eventos.length; i++) {
            if (eventos[i].nome === p) return eventos[i];
        }

        return null;
    };
    /**
    * @function {void} addEvento
    * Adiciona uma propriedade do tipo evento ao objeto.
    * @param {JSDialogEdit.Propriedade} p Evento a ser adicionado.
    * @throws InvalidPropriedadeException
    */
    this.addEvento = function ___jsdialogedit_objeto_addEvento(p) {
        if (p instanceof  JSDialogEdit.Propriedade) {
            eventos.push(p);
        } else {
            throw "JSDialogEdit.Objeto: InvalidPropriedadeException";
        }
    };
    /**
     * @function {void} removeEvento
     * Remove uma propriedade do tipo evento do objeto
     * @param {String} nome Nome do evento a ser removido
     */
    this.removeEvento = function ___jsdialogedit_objeto_removeEvento(nome) {
        var achei = false;
        for(var i = 0; i < eventos.length; i++) {
            if (achei) eventos[i-1] = eventos[i];
            if (eventos[i].nome === nome) achei = true;
        }
        if (achei) eventos.pop();
    };
    /**
     * @function {String} toString
     * Retorna uma representa&ccedil;&atilde;o textual para o Objeto, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return String representando o objeto
     */
    this.toString = function ___jsdialogedit_objeto_toString() {return this.CLASSE + "[#" + this.getId() + "]";};
    /**
     * @function {JSONObject} toObject
     * Serializa o Objeto no formato JSON com os dados das Propriedades e Eventos da classe.
     * @return Objeto JSON com as informa&ccedil;&otilde;es.
     */
    this.toObject = function ___jsdialogedit_objeto_toObject() {
        var saida = {};
        var i;
        
        saida.classe = this.CLASSE;
        saida.atributos = {};
        for(i = 0; i < propriedades.length; i++) {
            if (propriedades[i].tipo === JSDialogEdit.Propriedade.Tipos.Acao) continue;
            if (propriedades[i].habilitado && this[propriedades[i].get]() !== "" && this[propriedades[i].get]() !== null) {
                saida.atributos[propriedades[i].nome] = this[propriedades[i].get]();
            }
        }
        
        for(i = 0; i < eventos.length; i++) {
            if (eventos[i].habilitado && this[eventos[i].get]() !== "") {
                saida.atributos[eventos[i].nome] = this[eventos[i].get]();
            }
        }
        
        return saida;
    };
    /**
     * @function {String} toXml
     * Serializa o Objeto no formato XML com os dados das Propriedades e Eventos.<br>
     * Estrutura basica do XML:<br>
     * <code>
     * &lt;JSDialogEdit classe="Nome.Classe.Componente"&gt;<br>
     * &nbsp;&nbsp;&lt;Atributos&gt;<br>
     * &nbsp;&nbsp;&nbsp;&nbsp;&lt;Propriedade nome="NomePropriedade"&gt;ValorPropriedade&lt;/Propriedade&gt;<br>
     * &nbsp;&nbsp;&nbsp;&nbsp;&lt;Evento nome="NomeEvento"&gt;CodigoFonteFuncao&lt;/Evento&gt;<br>
     * &nbsp;&nbsp;&lt;/Atributos&gt;<br>
     * &lt;/JSDialogEdit&gt;<br>
     * </code>
     * @return String XML com as informa&ccedil;&otilde;es.
     */
    this.toXml = function ___jsdialogedit_objeto_toXml(tag) {
        var i, item;
        if (!tag) tag = "JSDialogEdit";
        tag = tag.replace(".",":");
        
        var elemento = document.createElementNS("http://code.google.com/p/jsdialogedit/", tag);
        var lstPropriedades = document.createElementNS("http://code.google.com/p/jsdialogedit/", "Atributos");
        
        for(i = 0; i < propriedades.length; i++) {
            if (propriedades[i].tipo === JSDialogEdit.Propriedade.Tipos.Acao) continue;
            if (propriedades[i].habilitado && this[propriedades[i].get]() !== "") {
                item = document.createElementNS("http://code.google.com/p/jsdialogedit/", "Propriedade");
                var valor = this[propriedades[i].get]();
                
                if (typeof valor === "object") {
                    if (window.JSON) {
                        item.textContent = JSON.stringify(valor);
                    } else {
                        item.textContent = valor.toJSONString();
                    }
                } else {
                    item.textContent = valor;
                }
                
                item.setAttribute("nome", propriedades[i].nome);
                lstPropriedades.appendChild(item);
            }
        }
        
        for(i = 0; i < eventos.length; i++) {
            if (eventos[i].habilitado && this[eventos[i].get]() !== "") {
                item = document.createElementNS("http://code.google.com/p/jsdialogedit/", "Evento");
                item.setAttribute("nome", eventos[i].nome);
                item.textContent = this[eventos[i].get]();
                lstPropriedades.appendChild(item);
            }
        }
        
        elemento.setAttribute("classe", this.CLASSE);
        elemento.appendChild(lstPropriedades);
        
        return elemento;
    };
    /**
     * @function {void} parseElemento
     * Utilizado internamente para processar os c&oacute;digos fonte gerados pelo Editor.
     * Realiza o processamento deste Componente em um elemento DOM.HTMLElement, podendo assim ser inserido em p&aacute;gina.
     */
    this.parseElemento = function ___jsdialogedit_objeto_parseElemento() {};
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe.
     * @todo Implementar de acordo com o funcionamento do clousure do JavaScript
     */
    this.destroy = function ___jsdialogedit_objeto_destroy() {
        for(var item in this) {
            this[item] = null;
            delete this[item];
        }
        id = null;
        self = null;
        propriedades = null;
        eventos = null;
    };

    var init = function ___jsdialogedit_objeto_init() {
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "ID",
            "descricao" : "Nome de identificacao do objeto",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getId",
            "set" : "setId",
            "habilitado" : true,
            "refresh" : true
        }));
    };
    init();
};

/**
 * @class {class} JSDialogEdit.Componente
 * Classe pai para todos os componentes utilizados no framework que necessitam ser renderizados na tela.<br>
 * Disponibiliza diversos metodos e propriedades compartilhados com a grande maioria dos componentes que a herda.
 * @constructor JSDialogEdit.Componente Construtor padr&atilde;o para Componetes do framework.
 * @param {String} elem Nome da Tag HTML que representar&aacute; o Componente na p&aacute;gina.
 * @param {JSONObject} prop {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Objeto
 */
JSDialogEdit.Componente = function (elem, prop) {
    JSDialogEdit.Objeto.call(this);

    var self       = this,
        elemento   = null,
        valor      = "",
        conteiner  = null,
        conector   = "",
        campo      = "",
        arrastavel = false,
        largura    = null,
        altura     = null,
        superior   = null,
        inferior   = null,
        esquerda   = null,
        direita    = null,
        zIndex     = "",
        classe     = "",
        estilo     = {},
        oldEstilo  = {},
        redimensionavel = false,
        tooltip = "",
        tabIndex = "",
        // contexto = "",
        desabilitado = false,
        destroy = this.destroy,
        setId = this.setId;
    
    var onfocus = function (e){};
    var onblur = function (e){};
    var onmouseover = function (e){};
    var onmouseout = function (e){};
    var onmousedown = function (e){};
    var onmouseup = function (e){};
    var onmousemove = function (e){};
    var onclick = function (e){};
    
    var onfocusSrc = "";
    var onblurSrc = "";
    var onmouseoverSrc = "";
    var onmouseoutSrc = "";
    var onmousedownSrc = "";
    var onmouseupSrc = "";
    var onmousemoveSrc = "";
    var onclickSrc = "";

    /** @property {final String} dragAxy Informa em quais dos eixos o JSDialogEdit.Componente pode ser movimentado. */
    this.dragAxy = "xy";
    /** @property {final String} resizeAxy Informa em quais dos eixos o JSDialogEdit.Componente pode ser redimensionado. */
    this.resizeAxy = "xy";
    /** @property {final String} larguraMin Informa o tamanho minimo para a largura do JSDialogEdit.Componente. */
    this.larguraMin = "1";
    /** @property {final String} alturaMin Informa o tamanho minimo para a altura do JSDialogEdit.Componente. */
    this.alturaMin = "1";
    /** @property {final String} eventoPadrao Informa um evento padrao para ser utilizado pelo editor. */
    this.eventoPadrao = null;
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto. */
    this.CLASSE = "JSDialogEdit.Componente";
    
    /**
     * @function {DOM.HTMLElement} getElemento
     * Retorna uma referencia ao objeto DOM.HTMLElement que renderiza o JSDialogEdit.Componente na p&aacute;gina.
     * @return Objeto HTML da p&aacute;gina
     */
    this.getElemento = function ___jsdialogedit_componente_getelemento() {return elemento;};
    /**
     * @function {DOM.HTMLElement}getElementoDesign
     * Retorna uma referencia ao objeto DOM.HTMLElement que renderiza o componente durante a edi&ccedil;&atilde;o da janela.
     * @return Objeto HTML em tempo de design
     */
    this.getElementoDesign = function ___jsdialogedit_componente_getElementoDesign() {return elemento;};
    /**
     * @function {boolean} getArrastavel
     * Retorna se o Componente pode ser arrastado pela tela
     * @return <i>true</i> se o usu&aacute;rio pode arrastar o Componente com o mouse, <i>false</i> caso contrario.
     */
    this.getArrastavel = function ___jsdialogedit_componente_getArrastavel()  {return arrastavel;};
    /**
     * @function {void} setArrastavel
     * Define se o Componente pode ser arrastado pela tela.
     * @param {boolean} v <i>true</i> se o usu&aacute;rio pode arrastar o Componente com o mouse, <i>false</i> caso contrario.
     */
    this.setArrastavel = function ___jsdialogedit_componente_setArrastavel(v) {arrastavel = v;};
    /**
     * @function {int} getLargura
     * Retorna a largura do Componente.
     * @return Largura corrente do Componente.
     */
    this.getLargura = function ___jsdialogedit_componente_getLargura() {
        if (largura) return largura;
        return elemento.clientWidth;
    };
    /**
     * @function {void} setLargura
     * Define a largura do Componente
     * @param {int} v Valor a ser difinido ao atributo
     */
    this.setLargura = function ___jsdialogedit_componente_setLargura(v) {
        v = parseInt(v, 10);
        if (v >= this.larguraMin) {
            largura  = v;
            elemento.style.width  = v + "px";
        }
    };
    /**
     * @function {int} getAltura
     * Retorna a altura do Componente baseado nos limites do objeto.
     * @return Altura do objeto determinda por fun&ccedil;&otilde;es disponiveis no DOM
     */
    this.getAltura = function ___jsdialogedit_componente_getAltura() {
        if (altura) return altura;
        return elemento.clientHeight;
    };
    /**
     * @function {void} setAltura
     * Define a altura do Componente.
     * @param {int} v Altura a ser atribuida ao componente.
     */
    this.setAltura = function ___jsdialogedit_componente_setAltura(v) {
        v = parseInt(v, 10);
        if (v >= this.alturaMin) {
            altura = v;
            elemento.style.height = v + "px";
        }
    };
    /**
     * @function {int} getSuperior
     * Retorna a coordenada Y da extremidade superior do Componente
     * @return Posi&ccedil;&atilde;o superior do Componente
     */
    this.getSuperior = function ___jsdialogedit_componente_getSuperior()  {
        if (superior) return superior;
        return elemento.clientTop;
    };
    /**
     * @function  setSuperior
     * Define a coordenada Y da extremidade superior do Componente
     * @param {int} v Novo valor para a posi&ccedil;&atilde;o superior do Componente
     */
    this.setSuperior = function ___jsdialogedit_componente_setSuperior(v) {
        v = parseInt(v, 10);
        superior = v;
        inferior = null;
        elemento.style.bottom = "";
        elemento.style.top = v + "px";
    };
    /**
     * @function {int} getInferior
     * Retorna a coordenada Y da extremidade inferior do Componente
     * @return Posi&ccedil;&atilde;o inferior do Componente
     */
    this.getInferior = function ___jsdialogedit_componente_getInferior() {
        if (inferior) return inferior;
        return elemento.getBoundingClientRect().bottom;
    };
    /**
     * @function {void} setInferior
     * Define a coordenada Y da extremidade inferior do Componente
     * @param {int} v Novo valor para a posi&ccedil;&atilde;o inferior do Componente
     */
    this.setInferior = function ___jsdialogedit_componente_setInferior(v) {
        v = parseInt(v, 10);
        inferior = v;
        superior = null;
        elemento.style.top = "";
        elemento.style.bottom = v + "px";
    };
    /**
     * @function {int} getEsquerda
     * Retorna a coordenada X da extremidade esquerda do Componente
     * @return Posi&ccedil;&atilde;o do lado esquerdo do Componente
     */
    this.getEsquerda = function ___jsdialogedit_componente_getEsquerda() {
        if (esquerda) return esquerda;
        return elemento.clientLeft;
    };
    /**
     * @function {void} setEsquerda
     * Define a coordenada X da extremidade esquerda do Componente
     * @param {int} v Novo valor para a posi&ccedil;&atilde;o do lado esquerdo do Componente
     */
    this.setEsquerda = function ___jsdialogedit_componente_setEsquerda(v) {
        v = parseInt(v, 10);
        esquerda = v;
        direita = null;
        elemento.style.right = "";
        elemento.style.left   = v + "px";
    };
    /**
     * @function {int} getDireita
     * Retorna a coordenada X da extremidade direita do Componente
     * @return Posi&ccedil;&atilde;o do lado direito do Componente
     */
    this.getDireita = function ___jsdialogedit_componente_getDireita()  {
        if (direita) return direita;
        return elemento.getBoundingClientRect().right;
    };
    /**
     * @function {void} setDireita
     * Define a coordenada X da extremidade direita do Componente
     * @param {int} v Novo valor para a posi&ccedil;&atilde;o do lado direito do Componente
     */
    this.setDireita = function ___jsdialogedit_componente_setDireita(v) {
        v = parseInt(v, 10);
        direita = v;
        esquerda = null;
        elemento.style.left = "";
        elemento.style.right  = v + "px";
    };
    /**
     * @function {String} getClasse
     * Retorna o valor do atributo "<i>class</i>" do HTMLElement que representa o Componente
     * @return Valor da propriedade class
     */
    this.getClasse     = function ___jsdialogedit_componente_getClasse()  {return classe;};
    /**
     * @function {void} setClasse
     * Define o valor do atributo "<i>class</i>" do HTMLElement que representa o Componente.<br>
     * Este atributo indica o nome de um classe no CSS da p&aacute;gina que definem como o Componente deve ser exibido.
     * Porem as defini&ccedil;&otilde;es de estilo do Componente definidos na janela Inspector
     * do Editor prevalecem sobre as defini&ccedil;&otilde;es da classe CSS
     * @param {String} v Valor da propriedade class
     */
    this.setClasse     = function ___jsdialogedit_componente_setClasse(v) {classe = v;elemento.className = v;};
    /**
     * @function {String} getConector
     * Retorna o ID do objeto {@link JSDialogEdit.Conexao} vinculado ao Componente
     * @return ID do JSDialogEdit.Conexao vinculado
     */
    this.getConector   = function ___jsdialogedit_componente_getConector()  {return conector;};
    /**
     * @function {void} setConector
     * Define o nome do objeto {@link JSDialogEdit.Conexao} a ser vinculado ao Componente.<br>
     * Quando for executado o m&eacute;todo {@link vincularDados} o Componente ir&aacute; buscar os dados no Conector para exibi&ccedil;&atilde;o.
     * @param {String} id Nome do objeto de Conexao vinculado.
     */
    this.setConector   = function ___jsdialogedit_componente_setConector(id)  {conector = id; if (conector === "") this.setCampo("");};
    /**
     * @function {JSDialogEdit.Conexao} getObjetoConector
     * @return Objeto Conector vinculado
     */
    this.getObjetoConector = function ___jsdialogedit_componente_getObjetoConector() { return conector === "" ? null : this.getConteiner().findFilho(conector); };
    /**
     * @function {String} getCampo
     * Retorna o nome do {@link JSDialogEdit.Conexao.Campo} de um objeto JSDialogEdit.Conexao vinculado ao Componente.
     * @return Nome do Campo vinculado
     */
    this.getCampo      = function ___jsdialogedit_componente_getCampo() {return campo;};
    /**
     * @function {void} setCampo
     * Vincula o Componente ao {@link JSDialogEdit.Conexao.Campo} com o nome informado.<br>
     * Quando o Componente esta vinculado a um Campo, n&atilde;o &eacute; poss&iacute;vel definir um valor padr&atilde;o via <i>Editor</i>.
     * O Campo deve constar da lista de campos do objeto JSDialogEdit.Conexao tambem viculado ao Componente
     * @param {String} c Nome do campo a ser vinculado
     */
    this.setCampo      = function ___jsdialogedit_componente_setCampo(c)  {
        this.setValor("");
        campo = c;
        if (elemento.value !== undefined) elemento.value = "[" + campo + "]";
        if (campo === "") this.setValor("");
    };
    /**
     * @function {JSDialogEdit.Conteiner} getConteiner
     * Retorna o objeto {@link JSDialogEdit.Conteiner} em que o Componente esta localizado
     * @return Conteiner que o Componente foi inserido
     */
    this.getConteiner  = function ___jsdialogedit_componente_getConteiner()  {return conteiner;};
    /**
     * @function {void} setConteiner
     * Define o objeto {@link JSDialogEdit.Conteiner} no qual o Componente ser&aacute; inserido
     * @param {JSDialogEdit.Conteiner} c Conteiner onde o Componente ser&aacute; inserido
     */
    this.setConteiner  = function ___jsdialogedit_componente_setConteiner(c)  {
        if (!(c instanceof JSDialogEdit.Conteiner)) throw "JSDialogEdit.Componente: InvalidConteinerException";
        conteiner = c;
    };
    /**
     * @function {String} getEstilo
     * Retorna o valor de um estilo aplicado ao Componente
     * @param {String} s Nome do estilo a ser retornado
     * @return String Valor do estilo
     */
    this.getEstilo     = function ___jsdialogedit_componente_getEstilo(s) {return estilo[s];};
    /**
     * @function {JSONObject} getEstilos
     * Retorna um objeto JSON do tipo {Chave:Valor} com os estilos aplicados ao Componente
     * @return  Object
     */
    this.getEstilos    = function ___jsdialogedit_componente_getEstilos()  {return estilo;};
    /**
     * @function {void} setEstilos
     * Recebe um Objeto JSON do tipo {Chave:Valor} com o nome/valor dos estilos aplicados ao Componente
     * @param {JSONObject} obj Objeto JSON do tipo {Chave:Valor} com o nome/valor dos estilos.<br>
     * Os nomes de estilo devem estar no formato JavaScript, como por exemplo: "<i>borderWidth</i>", "<i>fontFamily</i>"
     */
    this.setEstilos = function ___jsdialogedit_componente_setEstilos(obj) {
        var sty;
        for(sty in oldEstilo) {
            elemento.style[sty] = oldEstilo[sty];
        }
        oldEstilo = {};

        for(sty in obj) {
            oldEstilo[sty] = elemento.style[sty];
            elemento.style[sty] = obj[sty];
        }
        estilo = obj;
    };
    /**
     * @function addEstilo
     * Adiciona um estilo CSS ao componente
     * @param {String} s Nome do estilo a ser adicionado no formato de JavaScript
     * @param {String} v Valor a ser definido para o estilo adicionado
     */
    this.addEstilo = function ___jsdialogedit_componente_addEstilo(s, v) {
        if (s === null || v === null) throw "JSDialogEdit.Componente: InvalidEstiloException";
        estilo[s] = v;
        atualizaEstilo();
    };
    /**
     * @function removeEstilo
     * Remove um estilo previamente adicionado ao componente.
     * @param {String} s Nome do estilo a ser removido no formato de JavaScript.
     */
    this.removeEstilo = function ___jsdialogedit_componente_removeEstilo(s) {
        delete estilo[s];
        atualizaEstilo();
    };
    /**
     * @function {int} getZIndex
     * Retorna o valor do estilo z-index aplicado ao Componente
     * @return Profundidade do Componente em rela&ccedil;&atilde;o a p&aacute;gina
     */
    this.getZIndex     = function ___jsdialogedit_componente_getZIndex()  {return zIndex;};
    /**
     * @function {void} setZIndex
     * Define o valor do estilo z-index aplicado ao Componente.
     * Profundidade do Componente em rela&ccedil;&atilde;o a p&aacute;gina
     * @param {int} v valor numerico a ser definido a propriedade
     */
    this.setZIndex     = function ___jsdialogedit_componente_setZIndex(v) {
        zIndex = v;
        elemento.style.zIndex = v;
    };
    /**
     * @function {boolean} getRedimensionavel
     * Retorna se o Componente pode ou n&atilde;o ser redimensionado
     * @return <i>true</i> se o Componente pode ser redimensionado, <i>false</i> caso contrario.
     */
    this.getRedimensionavel = function ___jsdialogedit_componente_getRedimensionavel()  {return redimensionavel;};
    /**
     * @function {void} setRedimensionavel
     * Define se o Componente pode ou n&atilde;o ser redimensionado.
     * @param {boolean} v <i>true</i> se o Componente pode ser redimensionado, <i>false</i> caso contrario.
     */
    this.setRedimensionavel = function ___jsdialogedit_componente_setRedimensionavel(v) {
        if(JSDialogEdit.trace === 2) JSDialogEdit.Core.trace();
        
        if(v === redimensionavel) return;
        
        var funcao = function (e) {
            e = e || event;
            var target = e.target || e.srcElement;
            if (target != self.getElemento()) return;
            JSDialogEdit.resizeComp = self;
        };
        
        if (v) {
            if(elemento.className.indexOf("jsdeResize") == -1) elemento.className += " jsdeResize";
            this.registraEvento("mousedown", funcao);
        } else {
            elemento.className = elemento.className.replace(" jsdeResize", "");
            this.desregistraEvento("mousedown", funcao);
        }
        
        redimensionavel = v;
    };
    /**
     * @function {String} getTooltip
     * Retorna o texto para o Tooltip/Title do Componente
     * @return Texto exibido na caixa de dica
     */
    this.getTooltip    = function ()  {return tooltip;};
    /**
     * @function {void} setTooltip
     * Define o texto para o Tooltip/Title do Componente
     * @param {String} v Texto exibido na caixa de dica
     */
    this.setTooltip    = function (v) {elemento.title = tooltip = v;};
    /**
     * @function {int} getTabIndex
     * Retorna a posi&ccedil;&atilde;o do Componente na ordem de tabula&ccedil;&atilde;o do documento.
     * @return Retorna o indice do componente dentro da Ordem de Tabula&ccedil;&atilde;o.
     */
    this.getTabIndex   = function () {
        return tabIndex;
    };
    /**
     * @function {void} setTabIndex
     * Define a posi&ccedil;&atilde;o do Componente na ordem de tabula&ccedil;&atilde;o do documento.
     * @param {int} v Valor para o indice do componente.
     */
    this.setTabIndex   = function (v) {
        if(isNaN(v)) return;
        elemento.tabIndex = tabIndex = v;
    };
    /**
     * @function {boolean} getDesabilitado
     * Retorna se o Componente est&aacute; desabilitado ou n&atilde;o.
     * Quando o Componente &eacute; desabilitado, o usu&aacute;rio n&atilde;o consegue mais interagir com o mesmo.
     * @return <i>true</i> se o Componente esta desabilitado, <i>false</i> caso contrario.
     */
    this.getDesabilitado = function ()  {return desabilitado;};
    /**
     * @function {void} setDesabilitado
     * Define se Componente esta desabilitado ou n&atilde;o.
     * Quando o Componente &eacute; desabilitado, o usu&aacute;rio n&atilde;o consegue mais interagir com o mesmo.
     * @param {boolean} v <i>true</i> se o Componente esta desabilitado, <i>false</i> caso contrario.
     */
    this.setDesabilitado = function (v) {
        desabilitado = v;
        if (!conteiner || conteiner.getMode() !== "edicao") {
            elemento.disabled = desabilitado;
        }
    };
    /**
     * @function {String} getValor
     * Retorna o valor do Componente
     * @return valor
     */
    this.getValor      = function ()  {if (elemento.value !== undefined) valor = elemento.value;return valor;};
    /**
     * @function {void} setValor
     * Define o valor do Componente
     * @param {String} v valor
     */
    this.setValor      = function (v) {
        if (elemento.value !== undefined && (
            !this.getConteiner() ||
            this.getConteiner().getMode() != "edicao" ||
            this.getCampo() === "")
        ) elemento.value = v;
        valor = v;
    };
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function (v) {
        if (v === "") return;
        var oldId = this.getId();
        setId.call(this, v);
        elemento.id = v;
        if (elemento.name !== undefined) elemento.name = v;
        if(conteiner){
            delete conteiner[oldId];
            conteiner[v] = this;
        }
    };
    /**
     * @function {String} getVisivel
     * Retorna se o Componente esta visivel para o usu&aacute;rio
     * @return situa&ccedil;&atilde;o do componente
     */
    this.getVisivel = function () {return elemento.style.display != "none";};
    /**
     * @function {void} setVisivel
     * Define se o Componente esta visivel para o usu&aacute;rio
     * @param v situa&ccedil;&atilde;o do componente
     */
    this.setVisivel = function (v) {
        if (v) {
            elemento.style.display = "";
        } else {
            elemento.style.display = "none";
        }
    };
    /**
     * @function {String} getOnFocus
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o Componente receber o foco do teclado.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnFocus     = function () {return onfocusSrc;};
    /**
     * @function {String} getOnBlur
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o Componente perder o foco do teclado.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.getOnBlur      = function () {return onblurSrc;};
    /**
     * @function {String} getOnMouseOver
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o mouse passar sobre o Componente.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnMouseOver = function () {return onmouseoverSrc;};
    /**
     * @function {String} getOnMouseOut
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o mouse sair de sobre o Componente.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnMouseOut  = function () {return onmouseoutSrc;};
    /**
     * @function {String} getOnMouseDown
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o bot&atilde;o do mouse for pressionado sobre o Componente.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnMouseDown = function () {return onmousedownSrc;};
    /**
     * @function {String} getOnMouseUp
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o bot&atilde;o do mouse for solto sobre o Componente.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnMouseUp   = function () {return onmouseupSrc;};
    /**
     * @function {String} getOnMouseMove
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o mouse se mover sobre o Componente.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnMouseMove = function () {return onmousemoveSrc;};
    /**
     * @function {String} getOnClick
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o Componente receber um click do mouse.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnClick     = function () {return onclickSrc;};
    /**
     * @function {void} setOnFocus
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o Componente receber o foco do teclado.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.setOnFocus     = function (f) {onfocusSrc = f;};
    /**
     * @function {void} setOnBlur
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o Componente perder o foco do teclado.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.setOnBlur      = function (f) {onblurSrc = f;};
    /**
     * @function {void} setOnMouseOver
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o mouse passar sobre o Componente.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.setOnMouseOver = function (f) {onmouseoverSrc = f;};
    /**
     * @function {void} setOnMouseOut
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o mouse sair de sobre o Componente.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.setOnMouseOut  = function (f) {onmouseoutSrc = f;};
    /**
     * @function {void} setOnMouseDown
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o bot&atilde;o do mouse for pressionado sobre o Componente.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.setOnMouseDown = function (f) {onmousedownSrc = f;};
    /**
     * @function {void} setOnMouseUp
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o bot&atilde;o do mouse for solto sobre o Componente.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.setOnMouseUp   = function (f) {onmouseupSrc = f;};
    /**
     * @function {void} setOnMouseMove
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o mouse se mover sobre o Componente.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.setOnMouseMove = function (f) {onmousemoveSrc = f;};
    /**
     * @function {void} setOnClick
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o Componente receber um click do mouse.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.setOnClick     = function (f) {onclickSrc = f;};
    /**
     * @function {void} setOnFocusFunction
     * Define a fun&ccedil;&atilde;o a ser executada quando ocorrer o evento <i>onfocus</i>.
     * Evento disparando quando o componente recebe o foco do teclado.<br>
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>void OnFocus(Event e)</i>
     */
    this.setOnFocusFunction = function (f) {onfocus = f;};
    /**
     * @function {void} setOnBlurFunction
     * Define a fun&ccedil;&atilde;o a ser executada quando ocorrer o evento <i>onblur</i>.
     * Evento disparando quando o componente perde o foco do teclado.<br>
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>void OnBlur(Event e)</i>
     */
    this.setOnBlurFunction = function (f) {onblur = f;};
    /**
     * @function {void} setOnMouseOverFunction
     * Define a fun&ccedil;&atilde;o a ser executada quando ocorrer o evento <i>onmouseover</i>.
     * Evento disparando quando o mouse entra na area sobre o componente.<br>
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>void OnMouseOver(Event e)</i>
     */
    this.setOnMouseOverFunction = function (f) {onmouseover = f;};
    /**
     * @function {void} setOnMouseOutFunction
     * Define a fun&ccedil;&atilde;o a ser executada quando ocorrer o evento <i>onmouseout</i>.
     * Evento disparando quando o mouse sai da area sobre o componente.<br>
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>void OnMouseOut(Event e)</i>
     */
    this.setOnMouseOutFunction  = function (f) {onmouseout = f;};
    /**
     * @function {void} setOnMouseDownFunction
     * Define a fun&ccedil;&atilde;o a ser executada quando ocorrer o evento <i>onmousedown</i>.
     * Evento disparando quando o bot&atilde;o do mouse &eacute; pressionado sobre o componente.<br>
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>void OnMouseDown(Event e)</i>
     */
    this.setOnMouseDownFunction = function (f) {onmousedown = f;};
    /**
     * @function {void} setOnMouseUpFunction
     * Define a fun&ccedil;&atilde;o a ser executada quando ocorrer o evento <i>onmouseup</i>.
     * Evento disparando quando o bot&atilde;o do mouse &eacute; liberado sobre o componente.<br>
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>void OnMouseUp(Event e)</i>
     */
    this.setOnMouseUpFunction = function (f) {onmouseup = f;};
    /**
     * @function {void} setOnMouseMoveFunction
     * Define a fun&ccedil;&atilde;o a ser executada quando ocorrer o evento <i>onmousemove</i>.
     * Evento disparando quando o mouse &eacute; movido sobre o componente.<br>
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>void OnMouseMove(Event e)</i>
     */
    this.setOnMouseMoveFunction = function (f) {onmousemove = f;};
    /**
     * @function {void} setOnClickFunction
     * Define a fun&ccedil;&atilde;o a ser executada quando ocorrer o evento <i>onclick</i>.
     * Evento disparando quando o bot&atilde;o do mouse &eacute; clicado sobre o componente.<br>
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>void OnClick(Event e)</i>
     */
    this.setOnClickFunction     = function (f) {onclick = f;};
    /**
     * @function {void} registraEvento
     * Registra um evento no respectivo listener do Componente ou em um DOM.HTMLElement informado.
     * @param {String} evt Nome do evento a ser ouvido.
     * @param {Function} fnc Fun&ccedil;&atilde;o a ser executada quando o evento for disparado.
     * @param {optional DOM.HTMLElement} elm Opcional, elemento a ser ouvido, caso n&atilde;o informado utiliza o proprio Componente.
     */
    this.registraEvento = function (evt, fnc, elm) {
        if (!elm) elm = elemento;
        var funcao = function (e) {e = e || window.event;fnc.call(self, e);};
        JSDialogEdit.Core.capturaEvento(elm, evt, funcao);
    };
    this.desregistraEvento = function (evt, fnc, elm) {
        if (!elm) elm = elemento;
        var funcao = function (e) {e = e || window.event;fnc.call(self, e);};
        JSDialogEdit.Core.removeEvento(elm, evt, funcao);
    };
    /**
     * @function {void} appendHTMLChild
     * Adiciona um elemento HTML ao Componente
     * @param {DOM.HTMLElement} child Elemento HTML a ser adicionado
     */
    this.appendHTMLChild = function (child) {
        elemento.appendChild(child);
    };
    /**
     * @function {void} removeHTMLChild
     * Remove um elemento HTML do Componente
     * @param {DOM.HTMLElement} child Elemento HTML a ser removido
     */
    this.removeHTMLChild = function (child) {
        elemento.removeChild(child);
    };
    /**
     * @function {void} setClassName
     * Define uma Classe CSS para o Componente.
     * @param {String} classe Classe CSS a ser utilizada pelo Componente.
     * @deprecated Utilize o metodo {@link setClasse}.
     */
    this.setClassName = function (classe) {
        elemento.className = classe;
    };
    /**
     * @function {void} setCallback
     * Define, em tempo de execu&ccedil;&atilde;o, uma fun&ccedil;&atilde;o a ser chamada quando o evento informado ocorrer.<br>
     * Diferentemente do metodo {@link registraEvento} que utiliza o EventListener do DOM 3,
     * este metodo define diretamente a propriedade do elemento HTML referente ao evento informado.
     * Ou seja, a forma antiga de se definir um evento a um elemento HTML.
     * @param {String} evt Nome do evento a ser definido.
     * @param {Function} fnc Fun&ccedil;&atilde;o a ser executada quando o evento for disparado.
     * @deprecated Usar o metodo {@link registraEvento}.
     */
    this.setCallback = function (evt, fnc) {
        this.getElemento()[evt] = fnc;
    };
    /**
     * @function {string} getFuncao
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o enviada como parametro
     * @param {Function} funcao Fun&ccedil;&atilde;o a ser analisada
     */
    this.getFuncao = function (funcao) {
        var fnc = "" + funcao.valueOf();
        var start = fnc.indexOf("{") + 1;
        var src = fnc.substr(start, fnc.length-start-1);
        src = src.replace(/^\s+/, "");
        src = src.replace(/\s+$/, "");

        return src;
    };
    /**
     * @function {JSONObject} retornaListaConexaoXML
     * Retorna uma lista com os componentes ConexaoXML disponiveis.
     * @return Objeto JSON com o nome dos objetos de Conexao disponivel.
     */
    this.retornaListaConexaoXML = function (conexao) {
        if (conexao === undefined) conexao = conector;
        return conteiner.retornaListaConexaoXML(conexao);
    };
    /**
     * @function {JSONObject} retornaListaCampos
     * Retorna uma lista com os campos do componente ConexaoXML informado.
     * @param {String} conexao ID do componente ConexaoXML a ser lido.
     * @return Objeto JSON com os nomes dos Campos do componente de Conexao.
     */
    this.retornaListaCampos = function (conexao) {
        if (conexao === undefined) conexao = conector;
        return conteiner.retornaListaCampos(conexao);
    };
    /**
     * @function {void} vincularDados
     * Carrega o valor do conector de dados vinculado ao componente
     */
    this.vincularDados = function () {
        if (conector !== "" && this.getCampo() !== "") {
            var valor = this.getObjetoConector().getValorCampo(this.getCampo());
            this.setValor(valor);
        }
    };
    /**
     * @function {void} atualizaDados
     * Atualiza os dados exibidos pelo componente ap&oacute;s altera&ccedil;&atilde;o do compomente de Conexao vinculado
     */
    this.atualizaDados = function ___jsdialogedit_componente_atualizaDados() {
        this.vincularDados();
    };
    /**
     * @function {void} parseElemento
     * Utilizado internamente para processar os c&oacute;digos fonte gerados pelo Editor.
     * Realiza o processamento deste Componente em um elemento DOM.HTMLElement, podendo assim ser inserido em uma p&aacute;gina.
     */
    this.parseElemento = function () {
        // var fOnFocus, fOnBlur, fOnMouseOver, fOnMouseOut, fOnMouseDown, fOnMouseUp, fOnMouseMove, fOnClick;
        
        if (this.getEvento("OnFocus").habilitado) {
            //fOnFocus = new Function("e", this.getOnFocus());
            //this.getElemento().onfocus = function (e) {e = e || event;return fOnFocus.call(self, e);};
            onfocus = new Function("e", this.getOnFocus());
        }
        if (this.getEvento("OnBlur").habilitado) {
            //fOnBlur = new Function("e", this.getOnBlur());
            //this.getElemento().onblur = function (e) {e = e || event;return fOnBlur.call(self, e);};
            onblur = new Function("e", this.getOnBlur());
        }
        if (this.getEvento("OnMouseOver").habilitado) {
            //fOnMouseOver = new Function("e", this.getOnMouseOver());
            //this.getElemento().onmouseover = function (e) {e = e || event;return fOnMouseOver.call(self, e);};
            onmouseover = new Function("e", this.getOnMouseOver());
        }
        if (this.getEvento("OnMouseOut").habilitado) {
            //fOnMouseOut = new Function("e", this.getOnMouseOut());
            //this.getElemento().onmouseout = function (e) {e = e || event;return fOnMouseOut.call(self, e);};
            onmouseout = new Function("e", this.getOnMouseOut());
        }
        if (this.getEvento("OnMouseDown").habilitado) {
            //fOnMouseDown = new Function("e", this.getOnMouseDown());
            //this.getElemento().onmousedown = function (e) {e = e || event;return fOnMouseDown.call(self, e);};
            onmousedown = new Function("e", this.getOnMouseDown());
        }
        if (this.getEvento("OnMouseUp").habilitado) {
            //fOnMouseUp = new Function("e", this.getOnMouseUp());
            //this.getElemento().onmouseup = function (e) {e = e || event;return fOnMouseUp.call(self, e);};
            onmouseup = new Function("e", this.getOnMouseUp());
        }
        if (this.getEvento("OnMouseMove").habilitado) {
            //fOnMouseMove = new Function("e", this.getOnMouseMove());
            //this.getElemento().onmousemove = function (e) {e = e || event;return fOnMouseMove.call(self, e);};
            onmousemove = new Function("e", this.getOnMouseMove());
        }
        if (this.getEvento("OnClick").habilitado) {
            //fOnClick = new Function("e", this.getOnClick());
            //this.getElemento().onclick = function (e) {e = e || event;return fOnClick.call(self, e);};
            onclick = new Function("e", this.getOnClick());
        }
        
        elemento.disabled = desabilitado;
    };
    /**
     * @function {void} focus
     * Define o foco do formulario para o Componente
     */
    this.focus = function () {if (elemento.focus) elemento.focus();};
    /**
     * @function {void} blur
     * Retira o foco do Componente
     */
    this.blur = function () {if (elemento.blur) elemento.blur();};
    /**
     * @function {void} click
     * Executa o evento "onclick" do Componente
     */
    this.click = function () {if (elemento.click) elemento.click();};
    /**
     * @function {String} toString
     * Retorna uma representa&ccedil;&atilde;o textual para o Componente, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return texto representando o objeto
     */
    this.toString = function () {return this.CLASSE + "[" + elemento.tagName + "#" + this.getId() + "]";};
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in this) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    
    var atualizaEstilo = function () {
        var sty;
        for(sty in oldEstilo) {
            elemento.style[sty] = oldEstilo[sty];
        }
        oldEstilo = {};

        for(sty in estilo) {
            oldEstilo[sty] = elemento.style[sty];
            elemento.style[sty] = estilo[sty];
        }
    };
    
    var init = function () {
        elemento = document.createElement(elem);
        elemento.onfocus     = function (e) {e = e || event;return onfocus.call(self, e);};
        elemento.onblur      = function (e) {e = e || event;return onblur.call(self, e);};
        elemento.onmouseover = function (e) {e = e || event;return onmouseover.call(self, e);};
        elemento.onmouseout  = function (e) {e = e || event;return onmouseout.call(self, e);};
        elemento.onmousedown = function (e) {e = e || event;return onmousedown.call(self, e);};
        elemento.onmouseup   = function (e) {e = e || event;return onmouseup.call(self, e);};
        elemento.onmousemove = function (e) {e = e || event;return onmousemove.call(self, e);};
        elemento.onclick     = function (e) {e = e || event;return onclick.call(self, e);};
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Valor",
            "descricao" : "Valor do campo",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getValor",
            "set" : "setValor",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Largura",
            "descricao" : "Largura do Componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Numero,
            "get" : "getLargura",
            "set" : "setLargura",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Altura",
            "descricao" : "Altura do Componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Numero,
            "get" : "getAltura",
            "set" : "setAltura",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Superior",
            "descricao" : "Posicao superior do Componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Numero,
            "get" : "getSuperior",
            "set" : "setSuperior",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Inferior",
            "descricao" : "Posicao inferior do Componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Numero,
            "get" : "getInferior",
            "set" : "setInferior",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Esquerda",
            "descricao" : "Posicao esquerda do Componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Numero,
            "get" : "getEsquerda",
            "set" : "setEsquerda",
            "habilitado":true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Direita",
            "descricao" : "Posicao direita do Componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Numero,
            "get" : "getDireita",
            "set" : "setDireita",
            "habilitado":true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Classe",
            "descricao" : "Classe CSS utilizada pelo componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getClasse",
            "set" : "setClasse",
            "habilitado":true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Estilos",
            "descricao" : "Personaliza os estilos utilizados pelo componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Objeto,
            "get" : "getEstilos",
            "set" : "setEstilos",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Conector",
            "descricao" : "Indica que o valor do componente virá de um Campo do elemento Conexao XML",
            "tipo" : JSDialogEdit.Propriedade.Tipos.ListaFuncao,
            "get" : "getConector",
            "set" : "setConector",
            "funcao" : "retornaListaConexaoXML",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Campo",
            "descricao" : "Indica de qual campo do elemento Conexao XML virá os dados",
            "tipo" : JSDialogEdit.Propriedade.Tipos.ListaFuncao,
            "get" : "getCampo",
            "set" : "setCampo",
            "funcao" : "retornaListaCampos",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Tooltip",
            "descricao" : "Tooltip do componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getTooltip",
            "set" : "setTooltip",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "TabIndex",
            "descricao" : "Tabindex do componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Numero,
            "get" : "getTabIndex",
            "set" : "setTabIndex",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Desabilitado",
            "descricao" : "Define se o campo esta habilitado ou nao para interecao com o usu&aacute;rio",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getDesabilitado",
            "set" : "setDesabilitado",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Visivel",
            "descricao" : "Define se o campo ficara visivel ou nao no formulario",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getVisivel",
            "set" : "setVisivel",
            "habilitado" : true
        }));

        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnFocus",
            "descricao" : "Evento disparado quando o componente recebe o foco do teclado",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnFocus",
            "set" : "setOnFocus",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnBlur",
            "descricao" : "Evento disparado quando o componente perde o foco do teclado",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnBlur",
            "set" : "setOnBlur",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnMouseOver",
            "descricao" : "Evento disparado quando o mouse passa sobre o componente ",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnMouseOver",
            "set" : "setOnMouseOver",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnMouseOut",
            "descricao" : "Evento disparado quando o mouse sai de cima do componente ",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnMouseOut",
            "set" : "setOnMouseOut",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnMouseDown",
            "descricao" : "Evento disparado quando o botao do mouse e pressionado sobre o componente ",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnMouseDown",
            "set" : "setOnMouseDown",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnMouseUp",
            "descricao" : "Evento disparado quando o botao do mouse e solto sobre o componente ",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnMouseUp",
            "set" : "setOnMouseUp",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnMouseMove",
            "descricao" : "Evento disparado enquanto o mouse se mover sobre o componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnMouseMove",
            "set" : "setOnMouseMove",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : "Event e"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnClick",
            "descricao" : "Evento disparado quando o componente recebe um click do mouse",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnClick",
            "set" : "setOnClick",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));

        if (prop && !prop.ID) prop.ID = "Componente" + (new Date()).getTime();
        for(var item in prop) {
            self.set(item, prop[item]);
        }
    };
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Componente, JSDialogEdit.Objeto);

/**
 * @class {class} JSDialogEdit.CampoTexto
 * Classe pai para todos os componentes que permitem a entrada de texto com todos os seus atributos.
 * @constructor JSDialogEdit.CampoTexto Construtor base para os componetes de entrada de texto.
 * @param {String} elem Nome da Tag HTML que representara o componente na p&aacute;gina.
 * @param {JSONObject} prop {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Componente
 */
JSDialogEdit.CampoTexto = function (elem, prop) {
    JSDialogEdit.Componente.call(this, elem); //, prop);
    
    var self = this,
        propriedades = prop,
        somenteLeitura = false,
        obrigatorio = false,
        classe = "",
        onchange = function (e) {},
        onchangeSrc = "",
        onKeyDown = function (e) {},
        onKeyDownSrc = "",
        onKeyUp = function (e) {},
        onKeyUpSrc = "",
        onKeyPress = function (e) {},
        onKeyPressSrc = "",
        // getClasse = this.getClasse,
        setClasse = this.setClasse,
        destroy = this.destroy,
        parseElemento = this.parseElemento;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.CampoTexto";
    this.eventoPadrao = "OnChange";
    
    /**
     * @function {String} getClasse
     * Retorna o valor do atributo "<i>class</i>" do HTMLElement que representa o Componente
     * @return Valor da propriedade class
     */
    this.getClasse = function () {return classe;};
    /**
     * @function {void} setClasse
     * Define o valor do atributo "<i>class</i>" do HTMLElement que representa o Componente.<br>
     * Este atributo indica o nome de um classe no CSS da p&aacute;gina que definem como o Componente deve ser exibido.
     * Porem as defini&ccedil;&otilde;es de estilo do Componente definidos na janela
     * Inspector do Editor prevalecem sobre as defini&ccedil;&otilde;es da classe CSS
     * @param {String} v Valor da propriedade class
     */
    this.setClasse = function (v) {
        classe = v;
        if (obrigatorio) {
            setClasse.call(this, v + " jsdePreenchimentoObrigatorio");
        } else {
            setClasse.call(this, v);
        }
    };
    /**
     * @function {boolean} getSomenteLeitura
     * Retorna se o CampoTexto &eacute; somente leitura e n&atilde;o pode ser alterado pelo usu&aacute;rio
     * @return <i>true</i> se o Componente &eacute; somente leitura, <i>false</i> caso contrario.
     */
    this.getSomenteLeitura = function () {return somenteLeitura;};
    /**
     * @function {void} setSomenteLeitura
     * Define se o valor do CampoTexto pode ou n&atilde;o ser alterado pelo usu&aacute;rio
     * @param {boolean} v Valor a ser definido
     */
    this.setSomenteLeitura = function (v) {this.getElemento().readOnly = somenteLeitura = v;};
    /**
     * @function {boolean} getObrigatorio
     * Retorna se o CampoTexto &eacute; de preenchimento obrigatorio.
     * @return <i>true</i> se o Componente &eacute; obrigatorio, <i>false</i> caso contrario.
     */
    this.getObrigatorio = function () {return obrigatorio;};
    /**
     * @function {void} setObrigatorio
     * Define se o CampoTexto &eacute; de preenchimento obrigat&oacute;rio ou n&atilde;o.
     * Se o campo for obrigat&oacute;rio, o formul&acute;ario n&atilde;o &eacute; submetido
     * se o campo estiver em branco e um evento ErrorSubmit &eacute; lan&ccedil;ado.
     * @param {boolean} v Valor da flag Obrigatorio
     */
    this.setObrigatorio = function (v) {
        obrigatorio = v;
        this.setClasse(classe);
    };
    /**
     * @function {String} getOnChange
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada
     * quando o valor do CampoTexto for alterado pelo usu&aacute;rio
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnChange = function () {return onchangeSrc;};
    /**
     * @function {void} setOnChange
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada
     * quando o valor do CampoTexto for alterado pelo usu&aacute;rio
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.setOnChange = function (f) {onchangeSrc = f;};
    /**
     * @function {void} setOnChangeFunction
     * Define a fun&ccedil;&atilde;o a ser executada quando ocorrer o evento <i>OnChange</i>.
     * Evento disparando quando o usuario alterar o texto do CampoTexto.<br>
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>boolean OnChange(Event e)</i>
     */
    this.setOnChangeFunction = function (f) {onchange = f;};
    /**
     * @function {String} getOnKeyDown
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando
     * o usu&aacute;rio pressionar uma tecla enquanto o CampoTexto estiver com o foco
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnKeyDown = function () {return onKeyDownSrc;};
    /**
     * @function {void} setOnKeyDown
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando
     * o usu&aacute;rio pressionar uma tecla enquanto o CampoTexto estiver com o foco
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.setOnKeyDown = function (f) {onKeyDownSrc = f;};
    /**
     * @function {void} setOnKeyDownFunction
     * M&eacute;todo utilizado para definir o evento OnKeyDown em tempo de execu&ccedil;&atilde;o
     * @param {Function} f Fun&ccedil;&atilde;o a ser executada quando o evento for disparado
     */
    this.setOnKeyDownFunction = function (f) {onKeyDown = f;};
    /**
     * @function {String} getOnKeyUp
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o
     * usu&aacute;rio soltar uma tecla enquanto o CampoTexto estiver com o foco
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnKeyUp = function () {return onKeyUpSrc;};
    /**
     * @function {void} setOnKeyUp
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o
     * usu&aacute;rio soltar uma tecla enquanto o CampoTexto estiver com o foco
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.setOnKeyUp = function (f) {onKeyUpSrc = f;};
    /**
     * @function {void} setOnKeyUpFunction
     * M&eacute;todo utilizado para definir o evento OnKeyUp em tempo de execu&ccedil;&atilde;o
     * @param {Function} f Fun&ccedil;&atilde;o a ser executada quando o evento for disparado
     */
    this.setOnKeyUpFunction = function (f) {onKeyUp = f;};
    /**
     * @function {String} getOnKeyPress
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o
     * usu&aacute;rio digitar uma tecla enquanto o CampoTexto estiver com o foco
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnKeyPress = function () {return onKeyPressSrc;};
    /**
     * @function {void} setOnKeyPress
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o
     * usu&aacute;rio digitar uma tecla enquanto o CampoTexto estiver com o foco
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.setOnKeyPress = function (f) {onKeyPressSrc = f;};
    /**
     * @function {void} setOnKeyPressFunction
     * Define a fun&ccedil;&atilde;o a ser executada quando ocorrer o evento <i>OnKeyPress</i>.
     * Evento disparando quando uma tecla for pressionada enquanto o foco do teclado estiver no CampoTexto.<br>
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>boolean OnKeyPress(Event e)</i>
     */
     this.setOnKeyPressFunction = function (f) {onKeyPress = f;};
    /**
     * @function {void} parseElemento
     * Utilizado internamente para processar os c&oacute;digos fonte gerados pelo Editor.
     * Realiza o processamento deste Componente em um elemento DOM.HTMLElement,
     * podendo assim ser inserido em uma p&aacute;gina.
     */
    this.parseElemento = function () {
        parseElemento.call(this);
        var fOnChange   = new Function("e", self.getOnChange());
        var fOnKeyDown  = new Function("e", self.getOnKeyDown());
        var fOnKeyUp    = new Function("e", self.getOnKeyUp());
        var fOnKeyPress = new Function("e", self.getOnKeyPress());
        
        this.getElemento().onchange   = function (e) {e = e || event;return fOnChange.call(self, e);};
        this.getElemento().onkeydown  = function (e) {e = e || event;return fOnKeyDown.call(self, e);};
        this.getElemento().onkeyup    = function (e) {e = e || event;return fOnKeyUp.call(self, e);};
        this.getElemento().onkeypress = function (e) {e = e || event;return fOnKeyPress.call(self, e);};
    };
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in this) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    /**
     * @function {void} select
     * Seleciona o texto do Componente
     */
    this.select = function () {this.getElemento().select();};
    
    var init = function () {
       self.getPropriedade("Direita").habilitado = false;
       self.getPropriedade("Inferior").habilitado = false;

        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "SomenteLeitura",
            "descricao" : "Define se o campo podera ser alterado pelo usu&aacute;rio ou somente para exibicao",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getSomenteLeitura",
            "set" : "setSomenteLeitura",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Obrigatorio",
            "descricao" : "Define se o campo é de preenchimento obrigatório",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getObrigatorio",
            "set" : "setObrigatorio",
            "habilitado" : true
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnChange",
            "descricao" : "Evento ocorrido quando o texto do campo for alterado",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnChange",
            "set" : "setOnChange",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnKeyDown",
            "descricao" : "Evento ocorrido quando o usu&aacute;rio pressionar uma tecla",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnKeyDown",
            "set" : "setOnKeyDown",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnKeyUp",
            "descricao" : "Evento ocorrido quando o usu&aacute;rio liberar a tecla pressionada",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnKeyUp",
            "set" : "setOnKeyUp",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnKeyPress",
            "descricao" : "Evento ocorrido quando o usu&aacute;rio digitar uma tecla",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnKeyPress",
            "set" : "setOnKeyPress",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.CampoTexto, JSDialogEdit.Componente);

/**
 * @class {class} JSDialogEdit.CaixaTexto
 * Classe representando uma caixa de texto com todos os seus atributos.
 * @constructor JSDialogEdit.CaixaTexto Cria um novo componente do tipo Caixa de Texto (HTMLInputElement[type="text"]).
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente
 * @extends JSDialogEdit.CampoTexto
 */
JSDialogEdit.CaixaTexto = function () {
    JSDialogEdit.CampoTexto.call(this, "input"); //, arguments[0]);
    
    var self = this;
    var propriedades = arguments[0] || null;
    var tamanho = "";
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.CaixaTexto";
    
    /**
     * @function {int} getTamanhoMax
     * Retorna a quantidade maxima de caracteres que a CaixaTexto pode ter
     * @return Quantidade maxima de caracteres que a CaixaTexto pode ter
     */
    this.getTamanhoMax = function () {return tamanho;};
    /**
     * @function {void} setTamanhoMax
     * Define a quantidade maxima de caracteres que a CaixaTexto pode ter
     * @param {int} v Quantidade maxima de caracteres que a CaixaTexto pode ter
     */
    this.setTamanhoMax = function (v) {this.getElemento().maxLength = tamanho = v;};
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    
    var init = function () {
        self.getElemento().type = "text";
        self.resizeAxy = "x";
        self.getPropriedade("Altura").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "TamanhoMax",
            "descricao" : "Quantidade maxima de caracteres permitidos para o campo",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Numero,
            "get" : "getTamanhoMax",
            "set" : "setTamanhoMax",
            "habilitado" : true
        }));
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.CaixaTexto, JSDialogEdit.CampoTexto);

/**
 * @class {class} JSDialogEdit.Senha
 * Classe representando uma caixa de texto com todos os seus atributos.
 * @constructor JSDialogEdit.Senha Cria um novo componente do tipo Senha (HTMLInputElement[type="password"]).
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente
 * @extends JSDialogEdit.CampoTexto
 */
JSDialogEdit.Senha = function () {
    JSDialogEdit.CampoTexto.call(this, "input"); //, arguments[0]);
    
    var self = this;
    var propriedades = arguments[0] || null;
    var tamanho = "";
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Senha";
    
    /**
     * @function {int} getTamanhoMax
     * Retorna a quantidade maxima de caracteres que a CaixaTexto pode ter
     * @return Quantidade maxima de caracteres que a CaixaTexto pode ter
     */
    this.getTamanhoMax = function () {return tamanho;};
    /**
     * @function {void} setTamanhoMax
     * Define a quantidade maxima de caracteres que a CaixaTexto pode ter
     * @param {int} v Quantidade maxima de caracteres que a CaixaTexto pode ter
     */
    this.setTamanhoMax = function (v) {this.getElemento().maxLength = tamanho = v;};
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    
    var init = function () {
        self.getElemento().type = "password";
        self.resizeAxy = "x";
        self.getPropriedade("Altura").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "TamanhoMax",
            "descricao" : "Quantidade maxima de caracteres permitidos para o campo",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Numero,
            "get" : "getTamanhoMax",
            "set" : "setTamanhoMax",
            "habilitado" : true
        }));
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Senha, JSDialogEdit.CampoTexto);

/**
 * @class {class} JSDialogEdit.CampoData
 * Classe representando uma caixa de texto exclusiva para entrada de datas.
 * Apesar de no HTML5 existir um componente especifico para datas, o JSDialogEdit utiliza o HTMLInputElement[type="text"]
 * e atraves de JavaScript cria os comportamentos necessarioas para trabalhar com datas.
 * @constructor JSDialogEdit.CampoData Cria um novo componente do tipo Campo de Data (HTMLInputElement[type="text"]).
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente
 * @extends JSDialogEdit.CampoTexto
*/
JSDialogEdit.CampoData = function () {
    JSDialogEdit.CampoTexto.call(this, "input"); //, arguments[0]);
    
    var self = this,
        propriedades = arguments[0] || null,
        mantemCalendario = false,
        divCalendario,
        tabelaCalendario = null,
        tabelaMeses = null,
        celulasCalendario = [],
        celulasMeses = [],
        dataReferencia = {"dia":0, "mes":0, "ano":0},
        offsetDiaSemana = 0,
        listaMeses = [
            "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho",
            "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ],
        listaMesesAbr = [
            "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
            "Jul", "Ago", "Set", "Out", "Nov", "Dez"
        ],
        listaDiaSemana = ["D","S","T","Q","Q","S","S"],
        listaDiaSemanaAbr = ["Dom","Seg","Ter","Qua","Qui","Sex","Sab"],
        parseElemento = this.parseElemento;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.CampoData";
    
    /**
     * @function {void} parseElemento
     * Utilizado internamente para processar os c&oacute;digos fonte gerados pelo Editor.
     * Realiza o processamento deste Componente em um elemento DOM.HTMLElement,
     * podendo assim ser inserido em uma p&aacute;gina.
     */
    this.parseElemento = function () {
        parseElemento.call(self);
        criaCalendario();
        criaMeses();
        
        self.registraEvento("keyup", function (e) {
            e = e || event;
            formataCampoData(e);
        });
        self.registraEvento("change", function (e) {
            e = e || event;
            formataCampoData(e);
            var elm = e.srcElement || e.target;
            if (elm.value.length == 8) {
                var decada = (parseInt(elm.value.substr(6, 2), 10) > 30) ? "19":"20";
                elm.value = elm.value.substr(0, 6) + decada + elm.value.substr(6, 2);
            }
            validaCampoData(e);
        });
        self.registraEvento("focus", exibeCalendario);
        self.registraEvento("blur", ocultaCalendario);
        JSDialogEdit.Core.capturaEvento(divCalendario, "click", function (){
            mantemCalendario = true;
            self.getElemento().focus();
        });
    };
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    
    var formataCampoData = function (e) {
        var elm = e.srcElement || e.target;
        
        if (e.keyCode == 13)                    return true; // aceita enter
        if (e.keyCode == 9)                     return true; // aceita tab
        if (e.keyCode >= 35 && e.keyCode <= 40) return true;  // aceita teclas de direção
        if (e.keyCode == 8 || e.keyCode == 46)  return true;  // aceita backspace ou delete
        
        elm.value = elm.value.replace(/\D/g, "");
        elm.value = elm.value.substr(0, 8);
        elm.value = elm.value.replace(/(^\d{2})/, "$1/");
        elm.value = elm.value.replace(/(^\d{2}\/\d{2})/, "$1/");
        return true;
    };
    var validaCampoData = function (e) {
        var elm = e.srcElement || e.target;
        var dia, mes, ano;
        var diasMes = new Array(31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

        if (elm.value !== "") {
            if (elm.value.length < 10) {
                alert("Data invalida!");
                elm.value = "";
                return;
            }
            
            dia = elm.value.substring(0,2);
            mes = elm.value.substring(3,5);
            ano = elm.value.substring(6,10);

            if (isNaN(mes) || mes > 12 || mes === 0) {
                alert("Mes invalido!\n" + mes);
                elm.value = "";
                return;
            }

            if (isNaN(dia) || dia > diasMes[mes-1] || dia === 0) {
                alert("Dia invalido!\n" + dia);
                elm.value = "";
                return;
            }
        }
    };
    
    var criaCalendario = function () {
        var bodyCalendario = document.createElement("tbody"),
            cabecalho = null,
            rodape = null,
            linhasCalendario = [],
            hoje = new Date(),
            dia = "",
            mes = "",
            ano = "",
            x = 0;
        
        cabecalho = document.createElement("tr");
        
        celulasCalendario[42] = document.createElement("th");
        celulasCalendario[42].innerHTML = "\u25C0"; //"&lt;";
        celulasCalendario[42].className = "jsdeCampoDataItem jsdeCampoDataCabecalho";
        celulasCalendario[42].onclick = mesAnterior;
        cabecalho.appendChild(celulasCalendario[42]);
        
        celulasCalendario[43] = document.createElement("th");
        celulasCalendario[43].innerHTML = listaMeses[hoje.getMonth()] + " " + hoje.getFullYear();
        celulasCalendario[43].colSpan = "5";
        celulasCalendario[43].className = "jsdeCampoDataItem jsdeCampoDataCabecalho";
        celulasCalendario[43].onclick = exibeMeses;
        cabecalho.appendChild(celulasCalendario[43]);
        
        celulasCalendario[44] = document.createElement("th");
        celulasCalendario[44].innerHTML = "\u25B6"; //"&gt;";
        celulasCalendario[44].className = "jsdeCampoDataItem jsdeCampoDataCabecalho";
        celulasCalendario[44].onclick = mesSeguinte;
        cabecalho.appendChild(celulasCalendario[44]);
        
        bodyCalendario.appendChild(cabecalho);
        
        cabecalho = document.createElement("tr");
        for(x = 0; x < 7; x++) {
            celulasCalendario[x + 45] = document.createElement("th");
            celulasCalendario[x + 45].innerHTML = listaDiaSemana[x];
            celulasCalendario[x + 45].className = "jsdeCampoDataSemana";
            cabecalho.appendChild(celulasCalendario[x + 45]);
        }
        celulasCalendario[45].className += " jsdeCampoDataDomingo";
        bodyCalendario.appendChild(cabecalho);
        
        for(x = 0; x < 42; x++) {
            var y = parseInt(x / 7, 10);
            
            if (!linhasCalendario[y]) {
                linhasCalendario[y] = document.createElement("tr");
                linhasCalendario[y].className = "jsdeCampoDataLinha";
                bodyCalendario.appendChild(linhasCalendario[y]);
            }
            
            celulasCalendario[x] = document.createElement("td");
            celulasCalendario[x].innerHTML = x;
            linhasCalendario[y].appendChild(celulasCalendario[x]);
        }
        
        rodape = document.createElement("th");
        rodape.innerHTML = "Hoje: " +
                           listaDiaSemanaAbr[hoje.getDay()] + ", " +
                           hoje.getDate() + " " +
                           listaMesesAbr[hoje.getMonth()] + " " +
                           hoje.getFullYear();
        rodape.colSpan = "7";
        rodape.className = "jsdeCampoDataItem jsdeCampoDataRodape";
        rodape.onclick = selecionaHoje;
        cabecalho = document.createElement("tr");
        cabecalho.appendChild(rodape);
        bodyCalendario.appendChild(cabecalho);
        
        tabelaCalendario = document.createElement("table");
        tabelaCalendario.cellPadding = "2";
        tabelaCalendario.cellSpacing = "0";
        tabelaCalendario.appendChild(bodyCalendario);
        
        divCalendario = document.createElement("div");
        divCalendario.className = "jsdeCampoData";
        divCalendario.style.display = "none";
        divCalendario.appendChild(tabelaCalendario);
        
        dia = "0" + hoje.getDate();
        dia = dia.substr(dia.length - 2, 2);
        mes = "0" + (hoje.getMonth() + 1);
        mes = mes.substr(mes.length - 2, 2);
        ano = hoje.getFullYear();
        
        atualizaCalendario(dia + "/" + mes + "/" + ano);
    };
    var exibeCalendario = function (e) {
        var pai, elem, posX, posY;
        
        if (divCalendario.style.display == "block") return;
        
        e = e || event;
        elem = e.srcElement || e.target;
        if (elem.getBoundingClientRect &&
            elem.getBoundingClientRect().top &&
            elem.getBoundingClientRect().height) {
            posX = Math.round(elem.getBoundingClientRect().left);
            posY = 1 + Math.round(elem.getBoundingClientRect().top) + Math.round(elem.getBoundingClientRect().height);
        } else {
            pai = elem.parentNode;
            posX = elem.offsetLeft;
            posY = elem.offsetTop;
            while(pai != document.body) {
                posX += pai.offsetLeft;
                posY += pai.offsetTop;
                pai = pai.parentNode;
            }
        }
        
        divCalendario.style.display = "block";
        divCalendario.style.left = posX + "px";
        divCalendario.style.top  = posY + "px";
        atualizaCalendario();
        document.body.appendChild(divCalendario);
        mantemCalendario = false;
    };
    var ocultaCalendario = function (e) {
        window.setTimeout(
            function () {
                if (!mantemCalendario) {
                    divCalendario.style.display = "none";
                    //document.body.removeChild(divCalendario);
                }
                mantemCalendario = false;
            }, 300
        );
    };
    var atualizaCalendario = function (data) {
        var vlr = self.getValor(),
            x = 0,
            d = 0,
            mes = 0,
            objDate = null,
            dataSelecionada = null,
            dataHoje = new Date();
        
        if (divCalendario.firstChild != tabelaCalendario) {
            divCalendario.removeChild(divCalendario.firstChild);
            divCalendario.appendChild(tabelaCalendario);
        }
        
        if (!data && vlr !== "") {
            if (vlr.split("/")[0] == dataReferencia.dia &&
                vlr.split("/")[1] == dataReferencia.mes &&
                vlr.split("/")[2] == dataReferencia.ano) {
               return;
            } else {
                data = vlr;
            }
        }
        
        if (vlr !== "") {
            dataSelecionada = new Date(vlr.split("/")[2], parseInt(vlr.split("/")[1], 10) - 1, vlr.split("/")[0]);
        }
        
        //confirmar condicao
        if (data) {
            dataReferencia.dia = data.split("/")[0];
            dataReferencia.mes = data.split("/")[1];
            dataReferencia.ano = data.split("/")[2];
        }
        
        objDate = new Date(dataReferencia.ano, parseInt(dataReferencia.mes, 10) - 1, 1);
        offsetDiaSemana = objDate.getDay();
        
        for(x = 0; x < 42; x++) {
            celulasCalendario[x].innerHTML = "";
            celulasCalendario[x].className = "";
            celulasCalendario[x].onclick = "";
        }
        
        mes = parseInt(dataReferencia.mes, 10) - 1;
        
        for(x = offsetDiaSemana, d = 1; objDate.getMonth() == mes; x++, d++) {
            celulasCalendario[x].innerHTML = ("0" + d).substr(("0" + d).length - 2, 2);
            celulasCalendario[x].className = "jsdeCampoDataItem jsdeCampoDataDia";
            if (x % 7 === 0) celulasCalendario[x].className += " jsdeCampoDataDomingo";
            celulasCalendario[x].onclick = selecionaData;
            
            if (objDate.toDateString() == dataHoje.toDateString()) celulasCalendario[x].className += " jsdeCampoDataDiaHoje";
            if (dataSelecionada &&
                objDate.getDate() == dataSelecionada.getDate() &&
                objDate.getMonth() == dataSelecionada.getMonth() &&
                objDate.getFullYear() == dataSelecionada.getFullYear()) {
                celulasCalendario[x].className += " jsdeCampoDataDiaSelecionado";
            }
            objDate.setDate(objDate.getDate() + 1);
            if (objDate.getDate() == d) objDate.setDate(objDate.getDate() + 1);
        }
        
        celulasCalendario[43].innerHTML = listaMeses[parseInt(dataReferencia.mes, 10) - 1] + " " + dataReferencia.ano;
    };
    var mesAnterior = function (e) {
        var objDate, dia, mes, ano;
        
        objDate = new Date(dataReferencia.ano, parseInt(dataReferencia.mes, 10) - 1, 1);
        objDate.setDate(objDate.getDate()-1);
        dia = "01";
        mes = "0" + (objDate.getMonth() + 1);
        mes = mes.substr(mes.length - 2, 2);
        ano = objDate.getFullYear();
        
        atualizaCalendario(dia + "/" + mes + "/" + ano);
    };
    var mesSeguinte = function (e) {
        var objDate, dia, mes, ano;
        
        objDate = new Date(dataReferencia.ano, parseInt(dataReferencia.mes, 10) - 1, 1);
        objDate.setDate(objDate.getDate() + 31);
        dia = "01";
        mes = "0" + (objDate.getMonth() + 1);
        mes = mes.substr(mes.length - 2, 2);
        ano = objDate.getFullYear();
        
        atualizaCalendario(dia + "/" + mes + "/" + ano);
    };
    var selecionaData = function (e) {
        var elm, objDate, dia, mes, ano;
        
        e = e || event;
        elm = e.srcElement || e.target;
        
        if (elm.innerHTML === "") {
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            return;
        }
        
        objDate = new Date(dataReferencia.ano, parseInt(dataReferencia.mes, 10) - 1, elm.innerHTML);
        dia = "0" + objDate.getDate();
        dia = dia.substr(dia.length - 2, 2);
        mes = "0" + (objDate.getMonth() + 1);
        mes = mes.substr(mes.length - 2, 2);
        ano = objDate.getFullYear();
        self.setValor(dia + "/" + mes + "/" + ano);
        
        mantemCalendario = false;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    };
    var selecionaHoje = function (e) {
        var objDate, dia, mes, ano;
        e = e || event;
        
        objDate = new Date();
        dia = "0" + objDate.getDate();
        dia = dia.substr(dia.length - 2, 2);
        mes = "0" + (objDate.getMonth() + 1);
        mes = mes.substr(mes.length - 2, 2);
        ano = objDate.getFullYear();
        self.setValor(dia + "/" + mes + "/" + ano);
        
        mantemCalendario = false;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    };
    
    var criaMeses = function () {
        var bodyTabela = document.createElement("tbody"),
            cabecalho = null,
            linhasTabela = [],
            hoje = new Date(),
            /*dia = "",
            mes = "",
            ano = "",*/
            x = 0;
        
        cabecalho = document.createElement("tr");
        
        celulasMeses[12] = document.createElement("th");
        celulasMeses[12].innerHTML = "\u25C0"; //"&lt;";
        celulasMeses[12].className = "jsdeCampoDataItem jsdeCampoDataCabecalho";
        celulasMeses[12].onclick = anoAnterior;
        cabecalho.appendChild(celulasMeses[12]);
        
        celulasMeses[13] = document.createElement("th");
        celulasMeses[13].innerHTML = hoje.getFullYear();
        celulasMeses[13].colSpan = "2";
        celulasMeses[13].className = "jsdeCampoDataCabecalho";
        celulasMeses[13].onclick = exibeMeses;
        cabecalho.appendChild(celulasMeses[13]);
        
        celulasMeses[14] = document.createElement("th");
        celulasMeses[14].innerHTML = "\u25B6"; //"&gt;";
        celulasMeses[14].className = "jsdeCampoDataItem jsdeCampoDataCabecalho";
        celulasMeses[14].onclick = anoSeguinte;
        cabecalho.appendChild(celulasMeses[14]);
        
        bodyTabela.appendChild(cabecalho);

        for(x = 0; x < 12; x++) {
            var y = parseInt(x / 4, 10);
            
            if (!linhasTabela[y]) {
                linhasTabela[y] = document.createElement("tr");
                bodyTabela.appendChild(linhasTabela[y]);
            }
            
            celulasMeses[x] = document.createElement("td");
            celulasMeses[x].className = "jsdeCampoDataItem jsdeCampoDataMes";
            celulasMeses[x].innerHTML = listaMesesAbr[x];
            celulasMeses[x].onclick = selecionaMes;
            linhasTabela[y].appendChild(celulasMeses[x]);
        }
        
        tabelaMeses = document.createElement("table");
        tabelaMeses.cellPadding = "0";
        tabelaMeses.cellSpacing = "0";
        tabelaMeses.appendChild(bodyTabela);
    };
    var exibeMeses = function (e) {
        divCalendario.removeChild(divCalendario.firstChild);
        divCalendario.appendChild(tabelaMeses);
        mantemCalendario = true;
        self.getElemento().focus();
    };
    var atualizaMeses = function (data) {
        dataReferencia.dia = data.split("/")[0];
        dataReferencia.mes = data.split("/")[1];
        dataReferencia.ano = data.split("/")[2];
        
        celulasMeses[13].innerHTML = dataReferencia.ano;
    };
    var anoAnterior = function (e) {
        atualizaMeses(dataReferencia.dia + "/" + dataReferencia.mes + "/" + (parseInt(dataReferencia.ano, 10) - 1));
    };
    var anoSeguinte = function (e) {
        atualizaMeses(dataReferencia.dia + "/" + dataReferencia.mes + "/" + (parseInt(dataReferencia.ano, 10) + 1));
    };
    var selecionaMes = function (e) {
        var dia = "01",
            mes = null,
            ano  = dataReferencia.ano,
            elm = null,
            x = 0;
        
        e = e || event;
        elm = e.srcElement || e.target;
        
        for(x = 0; x < 12; x++) {
            if (elm.innerHTML == listaMesesAbr[x]) {
                mes = "0" + (x + 1);
                mes = mes.substr(mes.length - 2, 2);
                break;
            }
        }
        
        atualizaCalendario(dia + "/" + mes + "/" + ano);
    };
    
    var init = function () {
        self.getElemento().type = "text";
        self.resizeAxy = "";
        self.getPropriedade("Altura").habilitado = false;
        self.getPropriedade("Largura").habilitado = false;
        self.getElemento().size = 10;
        self.getElemento().maxLength = 10;
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.CampoData, JSDialogEdit.CampoTexto);

/**
 * @class {class} JSDialogEdit.Memorando
 * Classe representando uma caixa de texto de multiplas linhas (textarea) com todos os seus atributos.
 * @constructor JSDialogEdit.Memorando Cria um novo componente do tipo Memorando (HTMLTextAreaElement).
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.CampoTexto
 */
JSDialogEdit.Memorando = function () {
    JSDialogEdit.CampoTexto.call(this, "textarea"); //, arguments[0]);
    
    var self = this;
    var propriedades = arguments[0] || null;
    var layout = JSDialogEdit.Conteiner.TiposLayout.NONE;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Memorando";
    
    /**
     * @function {void} adicionaTexto
     * Adiciona um texto ao final do valor do Memorando
     * @param {String} v Texto a ser adicionado
     */
    this.adicionaTexto = function (v) {this.setValor(this.getValor() + v);};
    this.getLayout = function () {return layout;};
    this.setLayout = function (v) {
        var elemento = this.getElemento();
        layout = v;
        
        switch(v) {
            case JSDialogEdit.Conteiner.TiposLayout.SUPERIOR:
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "0px";
                elemento.style.left = "0px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.INFERIOR:
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "";
                elemento.style.left = "0px";
                elemento.style.bottom = "0px";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.CENTRO:
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "0px";
                elemento.style.left = "0px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = "100%";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Altura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.DIREITA:
                // TODO: :(
                break;
            case JSDialogEdit.Conteiner.TiposLayout.ESQUERDA:
                // TODO: :(
                break;
            case JSDialogEdit.Conteiner.TiposLayout.NONE:
            default:
                elemento.style.MozBoxSizing = "";
                elemento.style.WebkitBoxSizing = "";
                elemento.style.boxSizing = "";
                elemento.style.top = this.getSuperior() + "px";
                elemento.style.left = this.getEsquerda() + "px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = this.getLargura() + "px";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = true;
                self.getPropriedade("Altura").habilitado = true;
                self.getPropriedade("Superior").habilitado = true;
                self.getPropriedade("Esquerda").habilitado = true;
                break;
        }
    };
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    
    var init = function () {
        self.getElemento().cols = 1;
        self.getElemento().rows = 1;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Layout",
            "descricao" : "Layout do Componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getLayout",
            "set" : "setLayout",
            "habilitado" : true,
            "opcoes" : JSDialogEdit.Conteiner.TiposLayout
        }));
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Memorando, JSDialogEdit.CampoTexto);

/**
 * @class {class} JSDialogEdit.Botao
 * Classe representando um bot&atilde;o com todos os seus atributos.<br>
 * H&aacute; v&aacute;rios tipos de bot&otilde;es com a&ccedil;&otilde;es
 * j&aacute; definidas, porem podem ser alteradas com o uso dos eventos.
 * @constructor JSDialogEdit.Botao Cria um novo componente do tipo Bot&atilde;o
 * (HTMLInputElement[type="button" || type="reset" || type="submit"]).
 * @param {JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Componente
 */
JSDialogEdit.Botao = function () {
    JSDialogEdit.Componente.call(this, "input"); //, arguments[0]);
    
    var self = this;
    var propriedades = arguments[0] || null;
    var tipo = JSDialogEdit.Botao.TiposBotao.BOTAO;
    var setId = this.setId;

    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Botao";
    this.eventoPadrao = "OnClick";
    
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function (v) {
        if (v === "") return;
        var valor = this.getValor();
        var oldId = this.getId();
        setId.call(this, v);
        if (valor === oldId || valor === "") this.setValor(v);
    };
    /**
     * @function {JSDialogEdit.Botao.TiposBotao} getTipo
     * Retorna o valor da propredade tipo de botao. O tipo interfere diretamente
     * na forma que o botao e a janela vao reagir ao ser acionado<br>
     * Veja {@link JSDialogEdit.Botao.TiposBotao} para mais detalhes
     * @return O tipo de botao
     */
    this.getTipo = function () {return tipo;};
    /**
     * @function setTipo
     * Indica o tipo de botao a ser criado. O tipo interfere diretamente na
     * forma que o botao e a janela v&atilde;o reagir ao ser acionado<br/>
     * Veja {@link JSDialogEdit.Botao.TiposBotao} para saber os tipos validos.
     * @param {JSDialogEdit.Botao.TiposBotao} v valor a ser definido
     */
    this.setTipo = function (v) {
        var valor = this.getValor();
        tipo = v;
        this.getElemento().type = tipo === JSDialogEdit.Botao.TiposBotao.CANCELAR ? "button" : tipo;
        this.setValor(valor);
    };
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    
    var init = function () {
        self.resizeAxy = "x";
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        self.getPropriedade("Altura").habilitado = false;
        self.getPropriedade("Campo").habilitado = false;
    
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Tipo",
            "descricao" : "Tipo de botao ",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getTipo",
            "set" : "setTipo",
            "habilitado" : true,
            "opcoes" : JSDialogEdit.Botao.TiposBotao
        }));

        if (!propriedades || !propriedades.Tipo) {
            var valor = self.getValor();
            self.getElemento().type = tipo;
            if (valor != self.getValor()) self.setValor(valor);
        }
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Botao, JSDialogEdit.Componente);

/** @struct {static final} TiposBotao
 * Lista est&aacute;tica com os tipos de botoes que uma JSDialogEdit.Botao pode criar, conforme a seguir:
 * <ul>
 * <li><b>ENVIAR</b> : Cria um botao "SUBMIT" que ao ser acionado faz com que a janela
 * envie os dados para a URL especificada, dispara todo o ciclo de submit da Janela.
 * <li><b>CANCELAR</b> : Cria um botao que ao ser acionado fecha a janela sem enviar os dados.
 * Dispara o evendo OnClose da Janela.
 * <li><b>LIMPAR</b> : Cria um botao "RESET" que ao ser acionado for&ccedil;a todos os componentes
 * da Janela a voltarem para seus valores padr&otilde;es
 * <li><b>BOTAO</b> : Cria um botao clicavel sem uma a&ccedil;&atilde;o definida.
 * Precisa ser codificado no evento OnClick.
 * </ul>
 */
JSDialogEdit.Botao.TiposBotao = {
    /** @property {static final String} BOTAO
     * Indica que o bot&atilde;o n&atilde;o ter&aacute; um comportamento predefinido.
     */
    BOTAO:"button",
    /** @property {static final String} CANCELAR
     * Indica que quando o usu&aacute;rio pressionar o bot&atilde;o, ser&acute; disparado o evento Janela.OnClose.
     */
    CANCELAR:"cancel",
    /** @property {static final String} CANCELAR
     * Indica que quando o usu&aacute;rio pressionar o bot&atilde;o, ser&acute; disparado o evento Janela.OnSubmit.
     */
    ENVIAR:"submit",
    /** @property {static final String} CANCELAR
     * Indica que quando o usu&aacute;rio pressionar o bot&atilde;o, o todos os componentes do formul&aacute;rio
     * ter&atilde;o seus valores reinicializados.
     */
    LIMPAR:"reset"
};

/**
 * @class {class} JSDialogEdit.Rotulo
 * Classe representando um rotulo/label com todos os seus atributos.
 * @constructor JSDialogEdit.Rotulo Cria um novo componente do tipo R&oacute;tulo (HTMLLabelElement).
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Componente
 */
JSDialogEdit.Rotulo = function () {
    JSDialogEdit.Componente.call(this, "label"); //, arguments[0]);
    
    var self = this;
    var propriedades = arguments[0] || null;
    var referencia = "";
    var valor = "";
    var campo = "";
    var setId = this.setId;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Rotulo";
    this.eventoPadrao = "OnClick";

    /**
     * @function {String} getReferencia
     * Retorna o ID do campo do formulario a qual este rotulo esta vinculado
     */
    this.getReferencia = function () {return referencia;};
    /**
     * @function {void} setReferencia
     * Define o ID do campo do formulario a qual este rotulo esta vinculado
     * @param {String} v ID
     */
    this.setReferencia = function (v) {referencia = v;this.getElemento().htmlFor = v;};
    /**
     * @function {String} getValor
     * Retorna o valor do Componente
     * @return valor
     */
    this.getValor = function () {return valor;};
    /**
     * @function {void} setValor
     * Define o valor do Componente
     * @param {String} v valor
     */
    this.setValor = function (v) {
        if (!(this.getConteiner() &&
            this.getConteiner().getMode() == "edicao" &&
            this.getCampo() !== "")
        ) this.getElemento().innerHTML = valor = v;
    };
    /**
     * @function {String} getCampo
     * Retorna o nome do {@link JSDialogEdit.Conexao.Campo} de um objeto
     * JSDialogEdit.Conexao vinculado ao Componente.
     * @return Nome do Campo
     */
    this.getCampo = function () {return campo;};
    /**
     * @function {void} setCampo
     * Vincula o Componente ao {@link JSDialogEdit.Conexao.Campo} com o nome informado.<br>
     * <b>Aten&ccedil;&atilde;o!</b> Quando o Componente esta vinculado a um Campo,
     * n&atilde;o &eacute; possivel definir o valor via <i>Editor</i>.
     * O Campo deve constar da lista de campos do objeto JSDialogEdit.Conexao tambem viculado ao Componente
     * @param {String} c Nome do campo a ser vinculado
     */
    this.setCampo = function (v) {
        this.setValor("");
        campo = v;
        this.getElemento().innerHTML = "[" + v + "]";
        if (v === "") this.setValor(this.getId());
    };
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function (v) {
        if (v === "") return;
        var oldId = this.getId();
        setId.call(this, v);
        if (valor === oldId || valor === "") this.setValor(v);
    };
    /**
     * @function {JSONObject} getListaReferencia
     * Retorna um objeto com referencia aos componentes da janela para vincula&ccedil;&atilde;o com o label
     */
    this.getListaReferencia = function () {
        var retono = {"":""};
        var itens  = this.getConteiner().getFilhos();
        for(var i = 0; i < itens.length; i++) {
            if (itens[i] instanceof JSDialogEdit.CampoTexto || itens[i] instanceof JSDialogEdit.ListaSelecao) {
                retono[itens[i].getId()] = [itens[i].getId()];
            }
        }
        
        return retono;
    };
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    
    var init = function () {
        self.resizeAxy = "x";
        self.getPropriedade("Altura").habilitado = false;
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        self.getPropriedade("TabIndex").habilitado = false;
        self.getPropriedade("Desabilitado").habilitado = false;
        self.getEvento("OnFocus").habilitado = false;
        self.getEvento("OnBlur").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Referencia",
            "descricao" : "Componente a que este rotulo se refere",
            "tipo" : JSDialogEdit.Propriedade.Tipos.ListaFuncao,
            "get" : "getReferencia",
            "set" : "setReferencia",
            "funcao" : "getListaReferencia",
            "habilitado" : true
        }));
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Rotulo, JSDialogEdit.Componente);

/**
 * @class {class} JSDialogEdit.Imagem
 * Classe representando uma imagem com todos os seus atributos.
 * @constructor JSDialogEdit.Imagem Cria um novo componente do tipo Imagem (HTMLImageElement)
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Componente
 */
JSDialogEdit.Imagem = function () {
    JSDialogEdit.Componente.call(this, "img"); //, arguments[0]);
    
    var self = this;
    var propriedades = arguments[0] || null;
    var src = "";
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Imagem";
    this.eventoPadrao = "OnClick";

    /**
     * @function {String} getSrc
     * Retorna URL da imagem
     * @return URL da imagem
     * @deprecated
     */
    this.getSrc = function () {return src;};
    /**
     * @function {String} getImagem
     * Retorna URL da imagem
     * @return URL da imagem
     */
    this.getImagem = function () {return src;};
    /**
     * @function {void} setSrc
     * Define a URL da imagem
     * @param {String} v URL da imagem
     * @deprecated
     */
    this.setSrc = function (v) {this.getElemento().src = src = v;};
    /**
     * @function {void} setImagem
     * Define a URL da imagem
     * @param {String} v URL da imagem
     */
    this.setImagem = function (v) {this.getElemento().src = src = v;};
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    
    var init = function () {
        self.setSrc(JSDialogEdit.pastaImagens + "Imagem.png");
        
        self.getPropriedade("Valor").habilitado = false;
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        self.getPropriedade("TabIndex").habilitado = false;
        self.getPropriedade("Desabilitado").habilitado = false;
        self.getEvento("OnFocus").habilitado = false;
        self.getEvento("OnBlur").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Imagem",
            "descricao" : "Caminho da imagem a ser exibida",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getImagem",
            "set" : "setImagem",
            "habilitado" : true
        }));
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Imagem, JSDialogEdit.Componente);

/**
 * @class {class} JSDialogEdit.ListaSelecao
 * Classe representando uma lista de sele&ccedil;&atilde;o suspensa com todos os seus atributos.
 * @constructor JSDialogEdit.ListaSelecao Cria um novo componente Lista de Sele&ccedil;&atilde;o (HTMLSelectElement).
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Componente
 */
JSDialogEdit.ListaSelecao = function () {
    JSDialogEdit.Componente.call(this, "select"); //, arguments[0]);
    
    var self = this,
        propriedades = arguments[0] || null,
        valor = "",
        filhos = [],
        fonteDados = "",
        campoDados = "",
        valorDados = "",
        onchangeSrc = "",
        onchange = function (e) {},
        parseElemento = this.parseElemento,
        setCampo = this.setCampo,
        vincularDados = this.vincularDados;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.ListaSelecao";
    this.eventoPadrao = "OnChange";
    
    /**
     * @function {String} getTexto
     * Retorna o texto da op&ccedil;&atilde;o selecionada
     * @return Texto selecionado
     */
    this.getTexto = function () {
        var sel = this.getElemento().selectedIndex;
        if (sel == -1) {
            return valor;
        } else {
            return filhos[sel].getNome();
        }
    };
    /**
     * @function {String} getValor
     * Retorna o valor do Componente
     * @return valor
     */
    this.getValor = function () {
        var sel = this.getElemento().selectedIndex;
        if (sel == -1) {
            return valor;
        } else {
            return filhos[sel].getValor();
        }
    };
    /**
     * @function {void} setValor
     * Define o valor do Componente
     * @param {String} v valor
     */
    this.setValor = function (v) {
        var x = 0;
        if (!this.getConteiner() || this.getConteiner().getMode() != "edicao" || this.getCampo() === "") {
            valor = v;
            for(x = 0; x < filhos.length; x++) {
                if (filhos[x].getValor() == v) {
                    filhos[x].setSelecionado(true);
                } else {
                    filhos[x].setSelecionado(false);
                }
            }
        }
    };
    /**
     * @function {void} setCampo
     * Vincula o Componente ao {@link JSDialogEdit.Conexao.Campo} com o nome informado.<br>
     * <b>Aten&ccedil;&atilde;o!</b> Quando o Componente esta vinculado a um Campo,
     * n&atilde;o &eacute; possivel definir o valor via <i>Editor</i>.
     * O Campo deve constar da lista de campos do objeto JSDialogEdit.Conexao tambem viculado ao Componente
     * @param {String} v Nome do campo a ser vinculado
     */
    this.setCampo = function (v) {
        setCampo.call(this, v);
        valor = "";
        for(var x = 0; x < filhos.length; x++) {
            filhos[x].setSelecionado(false);
        }
    };
    /**
     * @function {JSONObject} getOpcoes
     * Retorna as op&ccedil;&otilde;es exibidas na lista
     * @return Opcoes disponiveis para o usu&aacute;rio
     */
    this.getOpcoes = function () {
        var ops = {};
        for(var x  = 0; x < filhos.length; x++) {
            ops[filhos[x].getNome()] = filhos[x].getValor();
        }
        
        return ops;
    };
    /**
     * @function {void} setOpcoes
     * Define as op&ccedil;&otilde;es a serem exibidas na lista.
     * Caso a propriedade CampoDados seja definida, n&atilde;o ser&aacute; possivel definir estas opcoes
     * @param {JSONObject} opcoes Objeto JSON do tipo {Chave:Valor}
     * com as informa&ccedil;&otilde;es para os itens da lista
     */
    this.setOpcoes = function (opcoes) {
        var x = 0;
        var vlr = this.getValor();
        var elm = this.getElemento();
        
        if (!this.getConteiner() || this.getConteiner().getMode() != "edicao" || this.getCampoDados() === "") {
            elm.options.length = 0;
            filhos.length = 0;
            for(var item in opcoes) {
                var op = new JSDialogEdit.ListaSelecao.ItemLista({"Nome":item, "Valor":opcoes[item]});
                op.setConteiner(this);
                filhos.push(op);
                elm.options[x] = op.getElemento();
                if (opcoes[item] == vlr) elm.selectedIndex = x;
                x++;
            }
        }
    };
    /**
     * @function {Array<ListaSelecao.ItemLista>} getFilhos
     * Retorna um array de ListaSelecao.ItemLista
     * @return Opcoes disponiveis para o usu&aacute;rio
     */
    this.getFilhos = function () {return filhos;};
    /**
     * @function {String} getFonteDados
     * Retorna o ID do componente de Conexao de onde as op&ccedil;&otilde;es disponiveis ser&atilde;o carregadas
     * @return ID do componente de Conexao
     */
    this.getFonteDados = function () {return fonteDados;};
    /**
     * @function {void} setFonteDados
     * Define o ID do componente de Conexao de onde as op&ccedil;&otilde;es disponiveis ser&atilde;o carregadas.
     * Ao definir esta propriedade, caso existam itens inseridos na propriedade Opcoes, as mesmas ser&atilde;o excluidas
     * @param {String} v ID do componente de Conexao
     */
    this.setFonteDados = function (v) {
        this.getElemento().options.length = 0;
        filhos.length = 0;
        fonteDados = v;
        self.getPropriedade("Opcoes").habilitado = v === "";
    };
    /**
     * @function {String} getCampoDados
     * Retorna o nome do campo do componente de Conexao de onde o texto das op&ccedil;&otilde;es disponiveis ser&atilde;o carregadas
     * @return Nome do campo do componente de Conexao
     */
    this.getCampoDados = function () {return campoDados;};
    /**
     * @function {void} setCampoDados
     * Define o nome do campo do componente de Conexao de onde o texto das op&ccedil;&otilde;es disponiveis ser&atilde;o carregadas.
     * Este texto estara visivel para o usu&aacute;rio final selecionar
     * @param {String} Nome do campo do componente de Conexao
     */
    this.setCampoDados = function (v) {campoDados = v;};
    /**
     * @function {String} setValorDados
     * Define o nome do campo do componente de Conexao de onde o valor das op&ccedil;&otilde;es disponiveis ser&atilde;o carregadas
     * @return Nome do campo do componente de Conexao
     */
    this.getValorDados = function () {return valorDados;};
    /**
     * @function {void} setValorDados
     * Define o campo do componente de Conexao de onde o valor das op&ccedil;&otilde;es disponiveis ser&atilde;o carregadas
     * Esses valores ser&atilde;o enviados no submit do formulario,
     * porem n&atilde;o sao visiveis ao usu&aacute;rio final
     * @param {String} v Nome do campo do componente de Conexao
     */
    this.setValorDados = function (v) {valorDados = v;};
    /**
     * @function {String} getOnChange
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o a ser executada
     * quando o usu&aacute;rio alterar a op&ccedil;&atilde;o selecionada
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnChange = function () {return onchangeSrc;};
    /**
     * @function {void} setOnChange
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute;
     * executada quando o usu&aacute;rio alterar a op&ccedil;&atilde;o selecionada
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.setOnChange = function (f) {onchangeSrc = f;};
    /**
     * @function {void} setOnChangeFunction
     * M&eacute;todo utilizado para definir o evento OnChange em tempo de execu&ccedil;&atilde;o
     * @param {Function} f Fun&ccedil;&atilde;o a ser executada quando o evento for disparado
     */
    this.setOnChangeFunction = function (f) {onchange = f;};
    /**
     * @function {void} parseElemento
     * Utilizado internamente para processar os c&oacute;digos fonte gerados pelo Editor.
     * Realiza o processamento deste Componente em um elemento DOM.HTMLElement,
     * podendo assim ser inserido em uma p&aacute;gina.
     */
    this.parseElemento = function () {
        parseElemento.call(this);
        var fOnChange = new Function("e", self.getOnChange());
        this.getElemento().onchange = function (e) {e = e || event;return fOnChange.call(self, e);};
    };
    /**
     * @function {JSONObject} retornaListaCampoDados
     * Retorna uma lista com os campos do componente ConexaoXML informado
     * @param {String} conexao ID do componente ConexaoXML a ser lido
     */
    this.retornaListaCampoDados = function (conexao) {
        if (conexao === undefined) conexao = this.getFonteDados();
        return this.getConteiner().retornaListaCampos(conexao);
    };
    /**
     * @function {void} vincularDados
     * Carrega o valor do conector de dados vinculado ao componente
     */
    this.vincularDados = function () {
        var elm, vlr, textos, valores;
        vincularDados.call(self);
        
        if (fonteDados !== "" && campoDados !== "") {
            elm = this.getElemento();
            vlr = this.getValor();
            textos = this.getConteiner().findFilho(fonteDados).getValoresCampo(campoDados);
            
            if (valorDados !== "") {
                valores = this.getConteiner().findFilho(fonteDados).getValoresCampo(valorDados);
            } else {
                valores = this.getConteiner().findFilho(fonteDados).getValoresCampo(campoDados);
            }
            
            elm.options.length = 0;
            for(var x = 0; x < textos.length; x++) {
                var op = new JSDialogEdit.ListaSelecao.ItemLista({"Nome":textos[x].replace(" ", "_"), "Valor":valores[x]});
                op.setConteiner(this);
                filhos.push(op);
                elm.options[x] = op.getElemento();
                if (valores[x] == vlr) elm.selectedIndex = x;
            }
        }
    };
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    
    var init = function () {
        self.resizeAxy = "x";
        self.getPropriedade("Altura").habilitado = false;
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Opcoes",
            "descricao" : "Lista de op&ccedil;&otilde;es disponíveis para selecao",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Objeto,
            "get" : "getOpcoes",
            "set" : "setOpcoes",
            "habilitado" : true,
            "refresh":true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "FonteDados",
            "descricao" : "Indica que a lista de opções virá de um Campo do elemento Conexao XML",
            "tipo" : JSDialogEdit.Propriedade.Tipos.ListaFuncao,
            "get" : "getFonteDados",
            "set" : "setFonteDados",
            "funcao" : "retornaListaConexaoXML",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "CampoDados",
            "descricao" : "Indica de qual campo do elemento Conexao XML virá o texto a ser exibido",
            "tipo" : JSDialogEdit.Propriedade.Tipos.ListaFuncao,
            "get" : "getCampoDados",
            "set" : "setCampoDados",
            "funcao" : "retornaListaCampoDados",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "ValorDados",
            "descricao" : "Indica de qual campo do elemento Conexao XML virá o valor a ser atribuido",
            "tipo" : JSDialogEdit.Propriedade.Tipos.ListaFuncao,
            "get" : "getValorDados",
            "set" : "setValorDados",
            "funcao" : "retornaListaCampoDados",
            "habilitado" : true
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnChange",
            "descricao" : "Evento ocorrido quando a opcao do campo for alterada",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnChange",
            "set" : "setOnChange",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.ListaSelecao, JSDialogEdit.Componente);

/**
 * @class {class} JSDialogEdit.ListaSelecao.ItemLista
 * Classe representando uma op&ccedil;&atilde;o de uma lista de sele&ccedil;&atilde;o.
 * @constructor JSDialogEdit.ListaSelecao.ItemLista Cria um novo item para uma JSDialogEdit.ListaSelecao (HTMLOptionElement).
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Objeto
 */
JSDialogEdit.ListaSelecao.ItemLista = function () {
    JSDialogEdit.Objeto.call(this);
    
    var self = this,
        elemento = null,
        propriedades = arguments[0] || null,
        id = "",
        nome = "",
        valor = "",
        conteiner = null;

    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.ListaSelecao.ItemLista";
    
    /**
     * @function {String} toString
     * Retorna uma representa&ccedil;&atilde;o textual para o ItemLista, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return texto representando o objeto
     */
    this.toString = function () {return this.CLASSE + "[#" + this.getId() + "]";};
    
    /**
     * @function {String} getId
     * Retorna o valor do IDentificador do componente utilizado para identificar de forma unica o componente na pagima HTML.
     * @return Propriedade ID do componente e do elemento HTML na p&aacute;gina
     */
    this.getId = function () {return id;};
    this.getNome = function () {return nome;};
    this.setNome = function (v) {
        elemento.text = nome = v;
        id = v.replace(/\s/g, "_");
    };
    this.getValor = function () {return elemento.value;};
    this.setValor = function (v) {elemento.value = v;};
    this.getSelecionado = function () {return elemento.selected;};
    this.setSelecionado = function (v) {elemento.selected = v;};
    this.getElemento = function () {return elemento;};
    this.getConteiner = function () {return conteiner;};
    this.setConteiner = function (v) {
        if (v instanceof JSDialogEdit.ListaSelecao) {
            conteiner = v;
        } else {
            throw "JSDialogEdit.ListaSelecao.ItemLista: ConteinerInvalidoException";
        }
    };
    
    var init = function () {
        elemento = new Option(nome, valor);
        
        self.getPropriedade("ID").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Nome",
            "descricao" : "Nome do item",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getNome",
            "set" : "setNome",
            "habilitado" : true,
            "refresh":true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Valor",
            "descricao" : "Valor do item",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getValor",
            "set" : "setValor",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Selecionado",
            "descricao" : "Valor do item",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getSelecionado",
            "set" : "setSelecionado",
            "habilitado" : true
        }));
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.ListaSelecao.ItemLista, JSDialogEdit.Objeto);

/**
 * @class {class} JSDialogEdit.CaixaSelecao
 * Classe representando uma Caixa de Sele&ccedil;&atilde;o com todos os seus atributos.
 * @constructor JSDialogEdit.CaixaSelecao Cria um novo componente Caixa de Sele&ccedil;&atilde;o (HTMLInputElement[type="checkbox"]).
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Componente
 */
JSDialogEdit.CaixaSelecao = function () {
    JSDialogEdit.Componente.call(this, "div"); //, arguments[0]);
    
    var self = this,
        propriedades = arguments[0] || null,
        selecionado = false,
        checkbox = null,
        label = null,
        posLabel = "direita",
        tabindex = "",
        // habilitado = true,
        onchange = function () {},
        setId = this.setId,
        setValor = this.setValor,
        parseElemento = this.parseElemento;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.CaixaSelecao";
    this.eventoPadrao = "OnClick";
    
    /**
     * @function {String} toString
     * Retorna uma representa&ccedil;&atilde;o textual para a CaixaSelecao, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return texto representando o objeto
     */
    this.toString = function () {return this.CLASSE + "[#" + this.getId() + "]";};
    
    this.getSelecionado = function () {return selecionado;};
    this.setSelecionado = function (v) {checkbox.checked = selecionado = v;};
    
    this.getTabIndex = function () {return tabindex;};
    this.setTabIndex = function (v) {checkbox.tabIndex = tabindex = v;};
    
    this.getRotulo = function () {return label.innerHTML;};
    this.setRotulo = function (v) {label.innerHTML = v;};
    
    /**
     * @function {String} getId
     * Retorna o valor do IDentificador do componente utilizado para identificar de forma unica o componente na pagima HTML.
     * @return Propriedade ID do componente e do elemento HTML na p&aacute;gina
     */
    this.getId = function () {return checkbox.id;};
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function (v) {
        if (v === "") return;
        setId.call(this, v + "_conteiner");
        if (label.innerHTML == v || label.innerHTML === "") label.innerHTML = v;
        label.id = v + "_rotulo";
        label.htmlFor = v;
        checkbox.id = v;
        checkbox.name = v;
    };
    this.parseElemento = function () {
        parseElemento.call(this);
        checkbox.disabled = this.getDesabilitado();
    };
    this.getValor = function () {return selecionado;};
    this.setValor = function (v) {checkbox.checked = selecionado = v;};
    this.getPosicaoRotulo = function () {return posLabel;};
    this.setPosicaoRotulo = function (v) {
        switch(v) {
            case JSDialogEdit.CaixaSelecao.PosicaoRotulo.DIREITA:
                checkbox.style.cssFloat = "left";
                break;
            case JSDialogEdit.CaixaSelecao.PosicaoRotulo.ESQUERDA:
                checkbox.style.cssFloat = "right";
                break;
            default:
                alert("Valor invalido:" + v);
                return;
        }
        
        posLabel = v;
    };
    this.vincularDados = function () {
        if (this.getConector() !== "" && this.getCampo() !== "") {
            var valor = this.getObjetoConector().getValorCampo(this.getCampo());
            this.setSelecionado(valor === true);
        }
    };
    this.getOnChange = function () {return self.getFuncao(onchange);};
    this.setOnChange = function (f) {onchange = new Function(f);};
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    
    var init = function () {
        checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = "true";
        
        label = document.createElement("label");
        
        self.appendHTMLChild(checkbox);
        self.appendHTMLChild(label);
        self.getElemento().style.whiteSpace = "nowrap";
        
        self.resizeAxy = "x";
        self.getPropriedade("Valor").habilitado = false;
        self.getPropriedade("Altura").habilitado = false;
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Rotulo",
            "descricao" : "Rotulo do checkbox",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getRotulo",
            "set" : "setRotulo",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "PosRotulo",
            "descricao" : "Define a posicao do rotulo em relacao a Caixa de Selecao",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getPosicaoRotulo",
            "set" : "setPosicaoRotulo",
            "opcoes" : JSDialogEdit.CaixaSelecao.PosicaoRotulo,
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Selecionado",
            "descricao" : "Define se o checkbox deve estar marcado ou nao",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getSelecionado",
            "set" : "setSelecionado",
            "habilitado" : true
        }));
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.CaixaSelecao, JSDialogEdit.Componente);

/** @struct {static final} PosicaoRotulo
 * Lista est&aacute;tica com as posi&ccedil;&otilde;es que o rotulo de uma JSDialogEdit.CaixaSelecao pode ser exibido.
 */
JSDialogEdit.CaixaSelecao.PosicaoRotulo = {
    /** @property {static final String} DIREITA
     * Define que o r&oacute;tulo ser&aacute; exibido a direta da Caixa de Sele&ccedil;&atilde;o.
     */
    DIREITA:"direita",
    /** @property {static final String} ESQUERDA
     * Define que o r&oacute;tulo ser&aacute; exibido a esquerda da Caixa de Sele&ccedil;&atilde;o.
     */
    ESQUERDA:"esquerda"
};

/**
 * @class {class} JSDialogEdit.GrupoBotaoRadio
 * Classe representando uma lista de Bot&otilde;es R&aacute;dio com todos os seus atributos.
 * @constructor JSDialogEdit.GrupoBotaoRadio Cria um novo componente Grupo de Bot&atilde;o R&aacute;dio.
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Componente
 */
JSDialogEdit.GrupoBotaoRadio = function () {
    JSDialogEdit.Componente.call(this, "fieldset"); //, arguments[0]);
    
    var self = this,
        propriedades = arguments[0] || null,
        valor = "",
        opcoes = {},
        titulo = document.createElement("legend"),
        altura = 0,
        largura = 0,
        filhos = [],
        setId = this.setId,
        setValor = this.setValor,
        setAltura = this.setAltura,
        setLargura = this.setLargura;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.GrupoBotaoRadio";
    this.eventoPadrao = "OnClick";
    
    /**
     * @function {String} toString
     * Retorna uma representa&ccedil;&atilde;o textual para o GrupoBotaoRadio, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return texto representando o objeto
     */
    this.toString = function () {return this.CLASSE + "[#" + this.getId() + "]";};
    
    this.showTitulo = function (v) {
        if (v) {
            titulo.style.display = "";
        } else {
            titulo.style.display = "none";
        }
    };
    
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function (v) {
        setId.call(this, v);
        if (v === "") return;
        if (titulo.textContent == this.getId() || titulo.textContent === "") titulo.innerHTML = v;
        this.setOpcoes(opcoes);
    };
    
    this.setAltura = function (v) {
        setAltura.call(this, v);
        if (JSDialogEdit.Core.getBrowser().indexOf("gecko") == -1) return;
        
        var borda = this.getElemento().style.borderWidth;
        altura = v + parseInt(borda ? borda : 2, 10) * 2;
        this.getElemento().style.clip = "rect(0px, " + largura + "px, " + altura + "px, 0px)";
    };
    
    this.setLargura = function (v) {
        setLargura.call(this, v);
        if (JSDialogEdit.Core.getBrowser().indexOf("gecko") == -1) return;
        
        var borda = this.getElemento().style.borderWidth;
        largura = v + parseInt(borda ? borda : 2, 10) * 2;
        this.getElemento().style.clip = "rect(0px, " + largura + "px, " + altura + "px, 0px)";
    };
    
    this.getValor = function () {return valor;};
    this.setValor = function (v) {
        valor = v;
        if(arguments[1]) return;
        for(var i = 0; i < filhos.length; i++) filhos[i].setSelecionado(filhos[i].getValor() == valor);
    };
    
    this.getOpcoes = function () {return opcoes;};
    this.setOpcoes = function (v) {
        var qtde = 0;
        for(var i = 0; i < filhos.length; i++) {
            this.removeHTMLChild(filhos[i].getElemento());
            delete filhos[i];
        }
        filhos.length = 0;
        opcoes = v;
        for(var item in opcoes) {
            var rd = new JSDialogEdit.GrupoBotaoRadio.BotaoRadio({
                "ID":this.getId(),
                "Texto":item,
                "Valor":opcoes[item]
            });
            rd.setConteiner(this);
            if (opcoes[item] == valor) rd.setSelecionado(true);
            this.appendHTMLChild(rd.getElemento());
            filhos.push(rd);
            qtde++;
        }
        if (qtde > 0) this.setAltura(qtde*21 + 20);
    };
    
    this.getTitulo = function () {return titulo.textContent ? titulo.textContent : titulo.innerHTML;};
    this.setTitulo = function (v) {this.showTitulo(v !== "");titulo.innerHTML = v;};
    /**
     * @function {Array<GrupoBotaoRadio.BotaoRadio>} getFilhos
     * Retorna um array de GrupoBotaoRadio.BotaoRadio
     * @return Opcoes disponiveis para o usu&aacute;rio
     */
    this.getFilhos = function () {return filhos;};
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    
    var init = function () {
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        
        self.getElemento().style.padding = "0px";
        self.getElemento().style.overflow = "hidden";
        self.appendHTMLChild(titulo);
    
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Opcoes",
            "descricao" : "Lista de opcoes para o Radio group",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Objeto,
            "get" : "getOpcoes",
            "set" : "setOpcoes",
            "habilitado" : true,
            "refresh" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Titulo",
            "descricao" : "Titulo do Grupo de Radio",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getTitulo",
            "set" : "setTitulo",
            "habilitado" : true
        }));
        
        altura = 50;
        largura = 150;
        if (!propriedades || !propriedades.Largura) self.setLargura(largura);
        if (!propriedades || !propriedades.Altura) self.setAltura(altura);
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };

    init();
};
JSDialogEdit.Core.register(JSDialogEdit.GrupoBotaoRadio, JSDialogEdit.Componente);

/**
 * @class {class} JSDialogEdit.GrupoBotaoRadio.BotaoRadio
 * Classe representando um item da lista de Bot&otilde;es R&aacute;dio com todos os seus atributos.
 * @constructor JSDialogEdit.GrupoBotaoRadio.BotaoRadio Cria um novo Bot&atilde;o R&aacute;dio (HTMLInputElement[type="radio"]).
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Objeto
 */
JSDialogEdit.GrupoBotaoRadio.BotaoRadio = function () {
    JSDialogEdit.Objeto.call(this);
    
    var self = this,
        elemento = null,
        radio = null,
        label = null,
        propriedades = arguments[0] || null,
        texto = "",
        conteiner = null,
        setId = this.setId;

    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.GrupoBotaoRadio.BotaoRadio";
    
    /**
     * @function {String} toString
     * Retorna uma representa&ccedil;&atilde;o textual para o BotaoRadio, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return texto representando o objeto
     */
    this.toString = function () {return this.CLASSE + "[#" + this.getId() + "]";};
    
    /**
     * @function {String} getId
     * Retorna o valor do IDentificador do componente utilizado para identificar de forma unica o componente na pagima HTML.
     * @return Propriedade ID do componente e do elemento HTML na p&aacute;gina
     */
    this.setId = function (v) {
        if (v === "") return;
        radio.name = v;
        radio.id = "rd_" + v;
        label.id = "lbl_" + v;
        elemento.id   = "div_" + v;
    };
    this.getTexto = function () {return texto;};
    this.setTexto = function (v) {
        setId.call(this, v.replace(/\s/g,""));
        label.innerHTML = texto = v;
    };
    this.getValor = function () {return radio.value;};
    this.setValor = function (v) {radio.value = v;};
    this.getSelecionado = function () {return radio.checked;};
    this.setSelecionado = function (v) {radio.checked = v;};
    this.getElemento = function () {return elemento;};
    this.getConteiner = function () {return conteiner;};
    this.setConteiner = function (v) {
        if (v instanceof JSDialogEdit.GrupoBotaoRadio) {
            conteiner = v;
        } else {
            throw "JSDialogEdit.GrupoBotaoRadio.BotaoRadio: ConteinerInvalidoException";
        }
    };
    
    var seleciona = function() {
        if(conteiner) {
            conteiner.setValor(this.value, true);
        }
    };
    var init = function () {
        radio = document.createElement("input");
        radio.type = "radio";
        label = document.createElement("label");
        elemento = document.createElement("div");
        elemento.appendChild(radio);
        elemento.appendChild(label);
        
        radio.onclick = seleciona;
        
        self.getPropriedade("ID").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Texto",
            "descricao" : "Texto exibido para o item",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getTexto",
            "set" : "setTexto",
            "habilitado" : true,
            "refresh" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Valor",
            "descricao" : "Valor do item a ser enviado",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getValor",
            "set" : "setValor",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Selecionado",
            "descricao" : "Indica se o item esta selecionado",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getSelecionado",
            "set" : "setSelecionado",
            "habilitado" : true
        }));
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.GrupoBotaoRadio.BotaoRadio, JSDialogEdit.Objeto);

/**
 * @class {class} JSDialogEdit.TreeView
 * Classe representando um componente TreeView/Arvore com todos os seus atributos.
 * @constructor JSDialogEdit.TreeView Cria um novo componente TreeView/Arvore.
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Componente
 */
JSDialogEdit.TreeView = function () {
    JSDialogEdit.Componente.call(this, "div"); //, arguments[0]);
    
    var self = this,
        propriedades = arguments[0] || null,
        multiplo = false,                      // flag se e multiplo ou nao
        selecionado = null,                    // item atualmente selecionado
        marcados = null,                       // lista de itens marcados quando TreeView Multiplo
        filhos = [],                           // array com a arvore a ser exibida
        descendentes = [],                     // array com referencia a todos os nos da arvore
        valor = "",
        itensInseridos = 0,
        iconePadrao = "",
        oculto = null,
        layout = JSDialogEdit.Conteiner.TiposLayout.NONE,
        onchangeSrc = "",
        onexpandSrc = "",
        onchange = function (selecao) {},
        onexpand = function (item) {},
        setId = this.setId,
        setCampo = this.setCampo,
        toObject = this.toObject,
        parseElemento = this.parseElemento;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.TreeView";
    this.eventoPadrao = "OnClick";
    
    /**
     * @function {String} toString
     * Retorna uma representa&ccedil;&atilde;o textual para o TreeView, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return texto representando o objeto
     */
    this.toString = function () {return this.CLASSE + "[#" + this.getId() + "]";};
    /**
     * @function {JSONObject} toObject
     * Serializa o Objeto no formato JSON com os dados das Propriedades e Eventos da classe.
     * @return Objeto JSON com as informa&ccedil;&otilde;es.
     */
    this.toObject = function () {
        var obj = toObject.call(this);
        
        obj.filhos = [];
        for(var x = 0; x < filhos.length; x++) {
            obj.filhos.push(filhos[x].toObject());
        }
        
        return obj;
    };
    this.novoItem = function () {
        this.addFilho(new JSDialogEdit.TreeView.No({
            "ID":this.getId() + "_Item" + (++itensInseridos),
            "Texto":"Item" + (itensInseridos),
            "Valor":"Item" + (itensInseridos)
        }));
    };
    this.getOnChange = function () {return onchangeSrc;};
    this.setOnChange = function (f) {onchangeSrc = f;};
    this.setOnChangeFunction = function (f) {onchange = f;};
    this.getOnExpand = function () {return onexpandSrc;};
    this.setOnExpand = function (f) {onexpandSrc = f;};
    this.setOnExpandFunction = function (f) {onexpand = f;};
    this.getLayout = function () {return layout;};
    this.setLayout = function (v) {
        var elemento = this.getElemento();
        layout = v;
        
        switch(v) {
            case JSDialogEdit.Conteiner.TiposLayout.SUPERIOR:
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "0px";
                elemento.style.left = "0px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.INFERIOR:
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "";
                elemento.style.left = "0px";
                elemento.style.bottom = "0px";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.CENTRO:
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "0px";
                elemento.style.left = "0px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = "100%";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Altura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.DIREITA:
                // TODO: :(
                break;
            case JSDialogEdit.Conteiner.TiposLayout.ESQUERDA:
                // TODO: :(
                break;
            case JSDialogEdit.Conteiner.TiposLayout.NONE:
            default:
                elemento.style.MozBoxSizing = "";
                elemento.style.WebkitBoxSizing = "";
                elemento.style.boxSizing = "";
                elemento.style.top = this.getSuperior() + "px";
                elemento.style.left = this.getEsquerda() + "px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = this.getLargura() + "px";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = true;
                self.getPropriedade("Altura").habilitado = true;
                self.getPropriedade("Superior").habilitado = true;
                self.getPropriedade("Esquerda").habilitado = true;
                break;
        }
    };
    this.getEstrutura = function () {
        var retorno = "";
        for(var x = 0; x < filhos.length; x++) {
            retorno += filhos[x].getId() + "\r";
        }
        return retorno;
    };
    this.setEstrutura = function (v) {
        var x, lista = v.split("\n");
        
        for(x = filhos.length - 1; x >= 0; x--) {
            this.getElemento().removeChild(filhos[x].getElemento());
            delete filhos[x];
            filhos.pop();
        }
        
        for(x = 0; x < lista.length; x++) {
            this.addFilho(new JSDialogEdit.TreeView.No({ID:lista[x]}));
        }
    };
    
    /**
     * @function {Array<TreeView.No>} getFilhos
     * Retorna um array de TreeView.No
     * @return Opcoes disponiveis para o usu&aacute;rio
     */
    this.getFilhos = function () {return filhos;};
    /**
     * @function {TreeView.No} getFilho
     * Retorna o TreeView.No com o ID indicado
     * @param {string} id Nome do No a ser pesquisado
     * @return Item com o ID indicado
     */
    this.getFilho = function (id) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getId() == id) return filhos[x];
        }
        return null;
    };
    this.addFilho = function (c) {
        if (c instanceof JSDialogEdit.TreeView.No) {
            c.setConteiner(this);
            c.setIconePadrao(iconePadrao);
            c.setMultiplo(multiplo);
            filhos.push(c);
            this.registraDescendente(c);
            this.getElemento().appendChild(c.getElemento());
        } else {
            throw "JSDialogEdit.TreeView: NoFilhoInvalidoException";
        }
    };
    this.removeFilho = function (c) {
        var id = c.getId();
        var x;
        
        for(x = 0; x < filhos.length; x++) {
            if (filhos[x].getId() == id) {
                this.desregistraDescendente(c);
                this.getElemento().removeChild(c.getElemento());
                delete filhos[x];
                filhos.splice(x, 1);
                break;
            }
        }
    };
    this.findFilho = function (id) {
        for(var x = 0; x < descendentes.length; x++) {
            if (descendentes[x].getId() == id) return descendentes[x];
        }
        return null;
    };
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function (v) {
        if (v === "") return;
        setId.call(this, v);
        oculto.name = v;
        for(var x = 0; x < filhos.length; x++) {
            filhos[x].setId(v + "_Item" + (x + 1));
        }
    };
    this.getValor = function () {return valor;};
    this.setValor = function (v) {
        if (!this.getConteiner() || (this.getConteiner().getMode() != "edicao" && this.getCampo() === "")) {
            this.resetSelecao();
            valor = v;
            oculto.value = v;
            for(var x = 0; x < descendentes.length; x++) {
                if (descendentes[x].getValor() == v) {
                    descendentes[x].setSelecionado(true);
                    selecionado = descendentes[x];
                    if (!multiplo) break;
                }
            }
        }
    };
    this.getIconePadrao = function () {return iconePadrao;};
    this.setIconePadrao = function (v) {
        var x;
        iconePadrao = v;
        for(x = 0; x < filhos.length; x++) filhos[x].setIconePadrao(v);
    };
    
    /**
     * @function {void} setCampo
     * Vincula o Componente ao {@link JSDialogEdit.Conexao.Campo} com o nome informado.<br>
     * <b>Aten&ccedil;&atilde;o!</b> Quando o Componente esta vinculado a um Campo, n&atilde;o &eacute; possivel definir o valor via <i>Editor</i>.
     * O Campo deve constar da lista de campos do objeto JSDialogEdit.Conexao tambem viculado ao Componente
     * @param {String} c Nome do campo a ser vinculado
     */
    this.setCampo      = function (c)  {
        setCampo.call(this, "");
        this.setValor("");
        setCampo.call(this, c);
        if (c !== "") valor = "[" + c + "]";
    };
    this.getSelecao = function () {return selecionado;};
    this.resetSelecao = function () {
        for(var x = 0; x < descendentes.length; x++) descendentes[x].setSelecionado(false);
        selecionado = null;
        if (!multiplo) oculto.value = valor = "";
    };
    this.setNoSelecionado = function (c) {
        var x;
        
        if (multiplo) {
            for(x = 0; x < marcados.length; x++) {
                if (marcados[x] === c) break;
            }
            
            if (x == marcados.length) {
                c.setMarcado(true);
                marcados.push(c);
            } else {
                c.setMarcado(false);
                marcados.splice(x, 1);
            }
            
            atualizaSelecaoMultipla();
        } else {
            oculto.value = valor = c.getValor();
        }
        if (selecionado === c) return;
        this.resetSelecao();
        c.setSelecionado(true);
        selecionado = c;
        onchange.call(this, c);
    };
    this.getMultiplo = function () {return multiplo;};
    this.setMultiplo = function (v) {
        multiplo = v;
        if (v) {
            marcados = [];
        } else {
            marcados = null;
        }
        for(var x = 0; x < filhos.length; x++) filhos[x].setMultiplo(v);
    };
    this.resetMultiplo = function () {
        if (!multiplo) return;
        marcados = [];
        atualizaSelecaoMultipla();
    };
    this.registraDescendente = function (c) {
        var x = 0,
            achou = false,
            id = c.getId(),
            lstFilhos = c.getFilhos();
        
        for(x = 0; x < descendentes.length; x++) {
            if (descendentes[x].getId() == id) {
                achou = true;
                break;
            }
        }
        
        if (!achou) descendentes.push(c);
        
        if (lstFilhos.length > 0) {
            for(x = 0; x < lstFilhos.length; x++) {
                this.registraDescendente(lstFilhos[x]);
            }
        }
    };
    this.desregistraDescendente = function (c) {
        var id = c.getId();
        var subitens;
        var x, i;
        
        for(x = 0; x < descendentes.length; x++) {
            if (descendentes[x].getId() == id) {
                subitens = descendentes[x].getFilhos();
                if (subitens.length > 0) {
                    for(i = 0; i < subitens.length; i++) this.desregistraDescendente(subitens[i]);
                }
                delete descendentes[x];
                descendentes.splice(x, 1);
                break;
            }
        }
    };
    /**
     * @function {Array} getDescendentes
     * Retorna um Array com todos os nos filhos da estrutura.
     * Esta lista n&atilde;o &eacute; sincronizada, ou seja, se houver mudan&ccedil;a na estrutura,
     * ela n&atilde;o ser&aacute; replicada no array, ser&aacute; necess&aacute;rio chamar o metodo
     * novamante.
     * @return {Array} Lista com todos os n&oacute;s da estrutura
     */
    this.getDescendentes = function() {
        return descendentes.slice(0);
    };
    this.parseElemento = function () {
        parseElemento.call(this);
        
        onchange = new Function("selecao", this.getOnChange());
        onexpand = new Function("item", this.getOnExpand());
    };
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    this.expand = function (c) {
        onexpand.call(this, c);
    };
    var atualizaSelecaoMultipla = function () {
        var lista = [];
        for(var x = 0; x < marcados.length; x++) {
            if (lista !== "") lista += ", ";
            lista.push(marcados[x].getValor());
        }
        oculto.value = valor = lista.toString();
    };
    var init = function () {
        oculto = document.createElement("input");
        oculto.type = "hidden";
        self.appendHTMLChild(oculto);
        
        self.setAltura(100);
        self.setLargura(100);
        self.getElemento().className = "jsdeArvore";
        
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        self.getPropriedade("Tooltip").habilitado = false;
        self.getPropriedade("TabIndex").habilitado = false;
        self.getPropriedade("Desabilitado").habilitado = false;
        self.getEvento("OnFocus").habilitado = false;
        self.getEvento("OnBlur").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Multiplo",
            "descricao" : "Informa se pode ser selecionado mais de um item da Arvore",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getMultiplo",
            "set" : "setMultiplo",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "NovoItem",
            "descricao" : "Inclui um item na Arvore",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Acao,
            "funcao" : "novoItem",
            "habilitado" : true,
            "refresh" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "IconePadrao",
            "descricao" : "Define um icone para todos os itens da Arvore",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getIconePadrao",
            "set" : "setIconePadrao",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Layout",
            "descricao" : "Layout do Componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getLayout",
            "set" : "setLayout",
            "habilitado" : true,
            "opcoes" : JSDialogEdit.Conteiner.TiposLayout
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnChange",
            "descricao" : "Evento ocorrido apos a opcao do campo for alterada",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnChange",
            "set" : "setOnChange",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : "JSDialogEdit.TreeView.No selecao"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnExpand",
            "descricao" : "Evento ocorrido quando um no da Arvore for expandido",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnExpand",
            "set" : "setOnExpand",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : "JSDialogEdit.TreeView.No item"
        }));
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.TreeView, JSDialogEdit.Componente);

/** @property {static final String} JSDialogEdit.TreeView.CAMINHOIMAGEM caminho para as imagens utilizadas no TreeView */
JSDialogEdit.TreeView.CAMINHOIMAGEM = JSDialogEdit.pastaImagens;

/**
 * @class {class} JSDialogEdit.TreeView.No
 * Classe representando um No do componente TreeView<br/>
 * As seguintes propriedades podem ser definidas<br/>
 * id    : "idElemento",  //obrigatorio, unico<br/>
 * texto : "Texto",       //obrigatorio<br/>
 * Icone   : "imagem.gif"<br/>
 * @constructor JSDialogEdit.TreeView.No Cria um novo componente
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Objeto
 */
JSDialogEdit.TreeView.No = function () {
    JSDialogEdit.Objeto.call(this, arguments[0]);
    
    var self = this,
        elemento = null,
        conteiner = null,
        valor = "",
        iconePadrao = "",
        multiplo = false,
        propriedades = arguments[0],
        filhos = [],
        mais, divMultiplo, divImg, icone, texto, valorTexto, caption, conteudo,
        status = "fechado",
        itensInseridos = 0,
        tooltip = "",
        setId = this.setId,
        toObject = this.toObject;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.TreeView.No";
    
    /**
     * @function {String} toString
     * Retorna uma representa&ccedil;&atilde;o textual para o TreeView.No, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return texto representando o objeto
     */
    this.toString = function () {return this.CLASSE + "[#" + this.getId() + "]";};
    /**
     * @function {JSONObject} toObject
     * Serializa o Objeto no formato JSON com os dados das Propriedades e Eventos da classe.
     * @return Objeto JSON com as informa&ccedil;&otilde;es.
     */
    this.toObject = function () {
        var obj = toObject.call(this);
        
        obj.filhos = [];
        for(var x = 0; x < filhos.length; x++) {
            obj.filhos.push(filhos[x].toObject());
        }
        
        return obj;
    };
    this.novoItem = function () {
        this.addFilho(new JSDialogEdit.TreeView.No({
            "ID":this.getId() + "_" + (++itensInseridos),
            "Texto":"Item" + (itensInseridos),
            "Valor":"Item" + (itensInseridos)
        }));
    };
    
    this.getElemento = function (){return elemento;};
    this.getElementoDesign = function (){return elemento;};
    this.getConteiner  = function ()  {return conteiner;};
    this.setConteiner  = function (c)  {
        if (!(c instanceof JSDialogEdit.TreeView) && !(c instanceof JSDialogEdit.TreeView.No)) throw "JSDialogEdit.TreeView.No: ConteinerInvalidoException";
        conteiner = c;
    };
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} id Valor do ID a ser definido
     */
    this.setId = function (id) {
        if (id === "") return;
        var oldId = this.getId();
        
        setId.call(this, id);
        elemento.id    = "treeViewNo_" + id;
        caption.id     = "treeViewCaption_" + id;
        mais.id        = "treeViewMais_" + id;
        divMultiplo.id = "treeViewMult_" + id;
        divImg.id      = "treeViewImg_" + id;
        texto.id       = "treeViewItem_" + id;
        conteudo.id    = "treeViewConteudo_" + id;
        if (texto.innerHTML == oldId || texto.innerHTML === "") texto.innerHTML = id;
        
        for(var x = 0; x < filhos.length; x++) {
            filhos[x].setId(id + "_" + (x + 1));
        }
    };
    /**
     * @function {Array<TreeView.No>} getFilhos
     * Retorna um array de TreeView.No
     * @return Opcoes disponiveis para o usu&aacute;rio
     */
    this.getFilhos = function () {return filhos;};
    this.getFilho = function (id) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getId() == id) return filhos[x];
        }
        return null;
    };
    this.addFilho = function (c) {
        if (c instanceof JSDialogEdit.TreeView.No) {
            c.setConteiner(this);
            c.setIconePadrao(iconePadrao);
            c.setMultiplo(multiplo);
            filhos.push(c);
            conteudo.appendChild(c.getElemento());
            conteudo.style.display = "block";
            if (mais.title === "") {
                mais.className = "jsdeArvoreItemIconeRecolher";
                mais.title = "Recolher";
            }
            this.registraDescendente(c);
        } else {
            throw "JSDialogEdit.TreeView.No: NoInvalidoException";
        }
    };
    this.removeFilho = function (c) {
        var achou = false;
        var id = c.getId();
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getId() == id) {
                achou = true;
                delete filhos[x];
                filhos.splice(x, 1);
                break;
            }
        }
        if (achou) {
            conteudo.removeChild(c.getElemento());
        }
        
        if (filhos.length === 0) { 
            conteudo.style.display = "none";
            mais.className = "jsdeArvoreItemIconeBranco";
            mais.title = "";
        }
    };
    this.registraDescendente = function (c) {if (conteiner) conteiner.registraDescendente(c);};
    this.desregistraDescendente = function (c) {
        conteiner.desregistraDescendente(c);
    };
    this.resetSelecao = function () {conteiner.resetSelecao();};
    this.setNoSelecionado = function () {
        var c = arguments[0] || this;
        conteiner.setNoSelecionado(c);
    };
    this.setSelecionado = function (v) {
        if (v) {
            caption.className += " jsdeArvoreItemSelecionado";
        } else {
            caption.className = caption.className.replace(" jsdeArvoreItemSelecionado", "");
        }
    };
    this.isSelecionado = function () {return caption.className.indexOf("jsdeArvoreItemSelecionado") != -1;};
    this.setMarcado = function (v) {
        if (v) {
            caption.className += " jsdeArvoreItemMarcado";
        } else {
            caption.className = caption.className.replace(" jsdeArvoreItemMarcado", "");
        }
    };
    this.isMarcado = function () {return caption.className.indexOf("jsdeArvoreItemMarcado") != -1;};
    /**
     * @function {String} getTexto
     * Retorna o texto exibido pelo No
     * @return Texto exibido pelo No ao usu&aacute;rio.
     */
    this.getTexto = function () {return valorTexto;};
    /**
     * @function {void} setTexto
     * Define o texto a ser exibido pelo No
     * @param Texto a ser exibido pelo No ao usu&aacute;rio.
     */
    this.setTexto = function (v) {
        if (tooltip === "") {
            caption.title = v;
        }
        texto.innerHTML = valorTexto = v;
    };
    this.getValor = function () {return valor;};
    this.setValor = function (v) {valor = v;};
    /**
     * @function {String} getIcone
     * Retorna o caminho do icone exibido pelo No
     * @return Caminho do icone exibido pelo No ao usu&aacute;rio.
     */
    this.getIcone = function () {return icone;};
    /**
     * @function {void} setIcone
     * Define o caminho do icone a ser exibido pelo No
     * @param Caminho do icone a ser exibido pelo No ao usu&aacute;rio.
     */
    this.setIcone = function (v) {
        icone = v;
        if (v !== "") {
            divImg.style.backgroundImage = "url(" + v + ")";
            divImg.style.display = "";
        } else if (iconePadrao !== "") {
            divImg.style.backgroundImage = "url(" + iconePadrao + ")";
            divImg.style.display = "";
        } else {
            divImg.style.backgroundImage = "none";
            divImg.style.display = "none";
        }
    };
    this.setIconePadrao = function (v) {
        var x = 0;
        iconePadrao = v;
        
        if (icone === "") {
            if (v !== "") {
                divImg.style.backgroundImage = "url(" + v + ")";
                divImg.style.display = "";
            } else {
                divImg.style.backgroundImage = "none";
                divImg.style.display = "none";
            }
        }

        for(x = 0; x < filhos.length; x++) filhos[x].setIconePadrao(v);
        
        return this;
    };
    this.getMultiplo = function () {return multiplo;};
    this.setMultiplo = function (v) {
        multiplo = v;
        divMultiplo.style.display = v ? "" : "none";
        for(var x = 0; x < filhos.length; x++) filhos[x].setMultiplo(v);
    };
    this.getTooltip = function () { return tooltip;};
    this.setTooltip = function (v) {caption.title = tooltip = v;};
    this.expand = function () {
        if (arguments.length === 0) {
            clickMais(null, true);
        } else {
            conteiner.expand(arguments[0]);
        }
    };
    this.collapse = function () {
        if (arguments.length === 0) {
            clickMais(null, false);
        } else {
            conteiner.expand(arguments[0]);
        }
    };
    
    var clickMais = function (e, opcao) {
        if (mais.title === "") return;
        
        conteiner.expand(self);
        
        opcao = opcao !== undefined ? opcao : (mais.title == "Expandir");
        if (opcao) {
            mais.className = "jsdeArvoreItemIconeRecolher";
            mais.title = "Recolher";
            conteudo.style.display = "block";
        } else {
            mais.className = "jsdeArvoreItemIconeExpandir";
            mais.title = "Expandir";
            conteudo.style.display = "none";
        }
        
        if (e) {
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
        }
        
        return false;
    };
    
    var seleciona = function (e) {conteiner.setNoSelecionado(self);};
    
    var init = function () {
        var id = self.getId();
        icone = "";
        
        mais = document.createElement("div");
        mais.className = "jsdeArvoreItemIconeBranco";
        mais.id = "treeViewMais_" + id;
        mais.title = "";
        mais.onclick = clickMais;
        
        divMultiplo = document.createElement("div");
        divMultiplo.id = "treeViewMult_" + id;
        divMultiplo.className = "jsdeArvoreItemMultiplo";
        divMultiplo.style.display = "none";
        divMultiplo.onclick = seleciona;
        
        divImg = document.createElement("div");
        divImg.id = "treeViewImg_" + id;
        divImg.className = "jsdeArvoreItemIcone";
        divImg.style.display = "none";
        divImg.onclick = seleciona;
        divImg.ondblclick = clickMais;
        
        texto = document.createElement("span");
        texto.id = "treeViewItem_" + id;
        texto.className = "jsdeArvoreItemLabel";
        texto.innerHTML = id;
        texto.onclick = seleciona;
        texto.ondblclick = clickMais;
        
        caption = document.createElement("div");
        caption.id = "treeViewCaption_" + id;
        caption.className = "jsdeArvoreItem";
        caption.appendChild(mais);
        caption.appendChild(divMultiplo);
        caption.appendChild(divImg);
        caption.appendChild(texto);
        
        conteudo = document.createElement("div");
        conteudo.id = "treeViewConteudo_" + id;
        conteudo.style.marginLeft = "20px";
        conteudo.style.display = (status == "aberto") ? "block":"none";
        
        elemento = document.createElement("div");
        elemento.id = "treeViewItem_" + id;
        elemento.appendChild(caption);
        elemento.appendChild(conteudo);
        
        self.getPropriedade("ID").readonly = true;
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Texto",
            "descricao" : "Texto exibido no item da arvore",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getTexto",
            "set" : "setTexto",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Valor",
            "descricao" : "Valor do item da arvore",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getValor",
            "set" : "setValor",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Tooltip",
            "descricao" : "Tooltip do componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getTooltip",
            "set" : "setTooltip",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Icone",
            "descricao" : "Define o icone a ser exibido neste no da arvore",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getIcone",
            "set" : "setIcone",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "NovoItem",
            "descricao" : "Inclui um item na Arvore",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Acao,
            "funcao" : "novoItem",
            "habilitado" : true,
            "refresh" : true
        }));
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.TreeView.No, JSDialogEdit.Objeto);

/**
 * @class {class} JSDialogEdit.MenuConteiner
 * Classe representando uma Barra de Menu fixa no alto da Janela com todos os seus atributos, somente uma barra pode ser adicionada.
 * @constructor JSDialogEdit.MenuConteiner Cria um novo componente Barra de Menu para uma Janela.
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Objeto
 */
JSDialogEdit.MenuConteiner = function () {
    JSDialogEdit.Objeto.call(this);
    var self = this,
        propriedades = arguments[0],
        elemento = null,
        conteiner = null,
        filhos = [],
        setId = this.setId,
        toObject = this.toObject;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.MenuConteiner";
    
    /**
     * @function {JSONObject} toObject
     * Serializa o Objeto no formato JSON com os dados das Propriedades e Eventos da classe.
     * @return Objeto JSON com as informa&ccedil;&otilde;es.
     */
    this.toObject = function () {
        var obj = toObject.call(this);
        obj.filhos = [];
        for(var x = 0; x < filhos.length; x++) obj.filhos.push(filhos[x].toObject());
        return obj;
    };
    this.setId = function (v) {
        setId.call(this, v);
        elemento.id = v;
    };
    this.getElemento = function () {return elemento;};
    this.getElementoDesign = function () {return elemento;};
    this.getConteiner  = function () {return conteiner;};
    this.setConteiner  = function (v)  {conteiner = v;};
    /**
     * @function {Array<MenuItem>} getFilhos
     * Retorna um array de MenuItem
     * @return Opcoes disponiveis para o usu&aacute;rio
     */
    this.getFilhos = function () {return filhos;};
    this.getFilho = function (id) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getId() == id) return filhos[x];
        }
        return null;
    };
    this.addFilho = function (c) {
        if (c instanceof JSDialogEdit.MenuItem) {
            c.setConteiner(this);
            filhos.push(c);
            elemento.appendChild(c.getElemento());
        } else {
            throw "JSDialogEdit.MenuConteiner: FilhoInvalidoException";
        }
    };
    this.removeFilho = function (c) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x] === c) {
                elemento.removeChild(c.getElemento());
                delete filhos[x];
                filhos.splice(x, 1);
                break;
            }
        }
    };
    this.removeTodosFilhos = function () {
        while(filhos.length > 0) {
            elemento.removeChild(filhos[0].getElemento());
            delete filhos[0];
            filhos.splice(0, 1);
        }
    };
    this.novoMenu = function () {
        var coluna = new JSDialogEdit.MenuItem({
            "ID"    : "Menu" + (filhos.length + 1),
            "Texto" : "Menu " + (filhos.length + 1)
        });
        this.addFilho(coluna);
        return coluna;
    };
    /**
     * @function {JSDialogEdit.Objeto} findFilho
     * Localiza um Componente pelo ID independente de onde esteja na arvore de conteiners
     * @para {String} id Nome unico que identifica (ID) o componente a ser localizado
     */
    this.findFilho = function (id) {
        var c = this.getFilho(id);
        var chamador = arguments[1] || "";
        if (c === null) { 
            for(var x = 0; x < filhos.length; x++) {
                if (filhos[x].findFilho && filhos[x].getId() != chamador) {
                    c = filhos[x].findFilho(id, this.getId());
                    if (c !== null) break;
                }
            }
            
            if (c === null && this.getConteiner() !== null && this.getConteiner().getId() != chamador && !(this.getConteiner() instanceof JSDialogEdit.GerenciadorJanela)) {
                c = this.getConteiner().findFilho(id, this.getId());
            }
        }
        return c;
    };
    this.filhoAt = function (indice) {
        return filhos[indice];
    };
    this.indexOf = function (c) {
        for(var x = 0; x < filhos.length; x++)
            if (filhos[x] === c) return x;
        return -1;
    };
    this.getMode = function () {return this.getConteiner() !== null ? this.getConteiner().getMode() : null;};
    
    var alternaExbicao = function (e) {
        e = e || event;
        if (elemento.className.indexOf("jsdeMenuAtivo") == -1) {
            elemento.className += " jsdeMenuAtivo";
            //JSDialogEdit.Core.capturaEvento(window, "click", alternaExbicao);
        } else {
            elemento.className = elemento.className.replace(" jsdeMenuAtivo", "");
            //JSDialogEdit.Core.removeEvento(window, "click", alternaExbicao);
        }
    };
    var init = function () {
        elemento = document.createElement("ul");
        elemento.className = "jsdeMenuConteiner";
        elemento.onclick = alternaExbicao;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "NovoMenu",
            "descricao" : "Inclui um novo item ao menu",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Acao,
            "funcao" : "novoMenu",
            "habilitado" : true,
            "refresh" : true
        }));
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.MenuConteiner, JSDialogEdit.Objeto);

/**
 * @class {class} JSDialogEdit.MenuContexto
 * Classe representando uma Menu de Contexto.
 * @constructor JSDialogEdit.MenuContexto Cria um novo componente Menu de Contexto.
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Objeto
 */
JSDialogEdit.MenuContexto = function () {
    JSDialogEdit.Objeto.call(this);
    var self = this,
        propriedades = arguments[0],
        elemento = null,
        design = null,
        conteiner = null,
        filhos = [],
        setId = this.setId,
        toObject = this.toObject;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.MenuContexto";
    
    /**
     * @function {JSONObject} toObject
     * Serializa o Objeto no formato JSON com os dados das Propriedades e Eventos da classe.
     * @return Objeto JSON com as informa&ccedil;&otilde;es.
     */
    this.toObject = function () {
        var obj = toObject.call(this);
        obj.filhos = [];
        for(var x = 0; x < filhos.length; x++) obj.filhos.push(filhos[x].toObject());
        return obj;
    };
    this.setId = function (v) {
        setId.call(this, v);
        design.id = v;
    };
    this.getElemento = function () {return elemento;};
    this.getElementoDesign = function () {return design;};
    this.getConteiner  = function () {return conteiner;};
    this.setConteiner  = function (v)  {conteiner = v;};
    /**
     * @function {Array<MenuItem>} getFilhos
     * Retorna um array de MenuItem
     * @return Opcoes disponiveis para o usu&aacute;rio
     */
    this.getFilhos = function () {return filhos;};
    this.getFilho = function (id) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getId() == id) return filhos[x];
        }
        return null;
    };
    this.addFilho = function (c) {
        if (c instanceof JSDialogEdit.MenuItem) {
            c.setConteiner(this);
            filhos.push(c);
            elemento.appendChild(c.getElemento());
        } else {
            throw "JSDialogEdit.MenuContexto: FilhoInvalidoException";
        }
    };
    this.removeFilho = function (c) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x] === c) {
                elemento.removeChild(c.getElemento());
                delete filhos[x];
                filhos.splice(x, 1);
                break;
            }
        }
    };
    this.removeTodosFilhos = function () {
        while(filhos.length > 0) {
            elemento.removeChild(filhos[0].getElemento());
            delete filhos[0];
            filhos.splice(0, 1);
        }
    };
    this.indexOf = function (c) {
        for(var x = 0; x < filhos.length; x++) if (c === filhos[x]) return x;
        return -1;
    };
    this.novoMenu = function () {
        var coluna = new JSDialogEdit.MenuItem({
            "ID"    : "Menu" + (filhos.length + 1),
            "Texto" : "Menu " + (filhos.length + 1)
        });
        this.addFilho(coluna);
        return coluna;
    };
    /**
     * @function {JSDialogEdit.Objeto} findFilho
     * Localiza um Componente pelo ID independente de onde esteja na arvore de conteiners
     * @para {String} id Nome unico que identifica (ID) o componente a ser localizado
     */
    this.findFilho = function (id) {
        var c = this.getFilho(id);
        var chamador = arguments[1] || "";
        if (c === null) { 
            for(var x = 0; x < filhos.length; x++) {
                if (filhos[x].findFilho && filhos[x].getId() != chamador) {
                    c = filhos[x].findFilho(id, this.getId());
                    if (c !== null) break;
                }
            }
            
            if (c === null && this.getConteiner() !== null && this.getConteiner().getId() != chamador && !(this.getConteiner() instanceof JSDialogEdit.GerenciadorJanela)) {
                c = this.getConteiner().findFilho(id, this.getId());
            }
        }
        return c;
    };
    this.getMode = function () {return this.getConteiner() !== null ? this.getConteiner().getMode() : null;};
    
    var init = function () {
        elemento = document.createElement("ul");
        elemento.className = "jsdeMenuContexto jsdeMenuCaixa";
        design = document.createElement("img");
        design.src = JSDialogEdit.pastaImagens + "CampoOculto.png";
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "NovoMenu",
            "descricao" : "Inclui um novo item ao menu",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Acao,
            "funcao" : "novoMenu",
            "habilitado" : true,
            "refresh" : true
        }));
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.MenuContexto, JSDialogEdit.Objeto);

/**
 * @class {class} JSDialogEdit.MenuItem
 * Classe representando um item de uma Barra de Menu ou subitem do proprio item.
 * @constructor JSDialogEdit.MenuItem Cria um novo componente Item de Menu.
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Objeto
 */
JSDialogEdit.MenuItem = function () {
    JSDialogEdit.Objeto.call(this);
    
    var self = this,
        propriedades = arguments[0],
        filhos = [],
        elemento = null,
        label = null,
        conteudo = null,
        texto = "",
        link = "",
        icone = "",
        conteiner = null,
        onclick = function (e){},
        onclickSrc = "",
        setId = this.setId,
        parseElemento = this.parseElemento,
        toObject = this.toObject;
    
    this.CLASSE = "JSDialogEdit.MenuItem";
    this.eventoPadrao = "OnClick";
    
    /**
     * @function {JSONObject} toObject
     * Serializa o Objeto no formato JSON com os dados das Propriedades e Eventos da classe.
     * @return Objeto JSON com as informa&ccedil;&otilde;es.
     */
    this.toObject = function () {
        var obj = toObject.call(this);
        obj.filhos = [];
        for(var x = 0; x < filhos.length; x++) obj.filhos.push(filhos[x].toObject());
        return obj;
    };
    this.parseElemento = function () {
        parseElemento.call(this);
        var fOnClick = new Function("e", self.getOnClick());
        elemento.onclick = function (e) {
            e = e ? e : event;
            var item = this;
            if (this.parentNode.className.indexOf("jsdeMenuCaixa") != -1) {
                item.parentNode.style.display = "none";
                window.setTimeout(function(){
                    item.parentNode.style.display = "";
                }, 100);
            }
            fOnClick.call(self, e);
        };
    };
    this.setId = function (v) {
        if (label.innerHTML === elemento.id || label.innerHTML === "") label.innerHTML = v;
        setId.call(this, v);
        elemento.id = v;
    };
    this.getElemento = function () {return elemento;};
    this.getElementoDesign = function () {return elemento;};
    this.getConteiner  = function () {return conteiner;};
    this.setConteiner  = function (v)  {
        conteiner = v;
        if (conteiner instanceof JSDialogEdit.MenuItem) {
            if (label.innerHTML == "-") {
                label.innerHTML = '<hr size="1">';
                elemento.className = "jsdeMenuLinha";
            }
        } else if (label.innerHTML == '<hr size="1">') {
            label.innerHTML = "-";
            elemento.className = "jsdeMenuItem";
        }
    };
    this.getTexto = function () {return texto;};
    this.setTexto = function (v) {
        label.innerHTML = texto = v;
        elemento.className = "jsdeMenuItem";
        if (v === "-" && conteiner instanceof JSDialogEdit.MenuItem) {
            elemento.className = "jsdeMenuLinha";
            label.innerHTML = '<hr size="1">';
        }
    };
    this.getIcone = function (){return icone;};
    this.setIcone = function (v){
        icone = v;
        elemento.style.backgroundImage = "url(" + icone + ")";
    };
    this.getLink = function () {return link;};
    this.setLink = function (v) {label.href = link = v;};
    
    /**
     * @function {Array<MenuItem>} getFilhos
     * Retorna um array de MenuItem
     * @return Opcoes disponiveis para o usu&aacute;rio
     */
    this.getFilhos = function () {return filhos;};
    this.getFilho = function (id) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getId() == id) return filhos[x];
        }
        return null;
    };
    this.addFilho = function (c) {
        if (c instanceof JSDialogEdit.MenuItem) {
            c.setConteiner(this);
            filhos.push(c);
            conteudo.appendChild(c.getElemento());
            if (filhos.length == 1) {
                label.className = "jsdeMenuSeta";
                elemento.appendChild(conteudo);
            }
        } else {
            throw "JSDialogEdit.MenuConteiner: FilhoInvalidoException";
        }
    };
    this.removeFilho = function (c) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x] === c) {
                conteudo.removeChild(c.getElemento());
                delete filhos[x];
                filhos.splice(x, 1);
                if (filhos.length === 0) {
                    label.className = "";
                    elemento.removeChild(conteudo);
                }
                break;
            }
        }
    };
    this.removeTodosFilhos = function () {
        while(filhos.length > 0) {
            conteudo.removeChild(filhos[0].getElemento());
            delete filhos[0];
            filhos.splice(0, 1);
        }
        label.className = "";
        elemento.removeChild(conteudo);
    };
    this.filhoAt = function (indice) {
        return filhos[indice];
    };
    this.indexOf = function (c) {
        for(var x = 0; x < filhos.length; x++) if (c === filhos[x]) return x;
        return -1;
    };
    this.novoMenu = function () {
        var coluna = new JSDialogEdit.MenuItem({
            "ID"    : this.getId() + "_" + (filhos.length + 1),
            "Texto" : "SubMenu " + (filhos.length + 1)
        });
        this.addFilho(coluna);
        return coluna;
    };
    /**
     * @function {JSDialogEdit.Objeto} findFilho
     * Localiza um Componente pelo ID independente de onde esteja na arvore de conteiners
     * @para {String} id Nome unico que identifica (ID) o componente a ser localizado
     */
    this.findFilho = function (id) {
        var c = this.getFilho(id);
        var chamador = arguments[1] || "";
        if (c === null) { 
            for(var x = 0; x < filhos.length; x++) {
                if (filhos[x].findFilho && filhos[x].getId() != chamador) {
                    c = filhos[x].findFilho(id, this.getId());
                    if (c !== null) break;
                }
            }
            
            if (c === null && this.getConteiner() !== null && this.getConteiner().getId() != chamador && !(this.getConteiner() instanceof JSDialogEdit.GerenciadorJanela)) {
                c = this.getConteiner().findFilho(id, this.getId());
            }
        }
        return c;
    };
    this.getOnClick = function () {return onclickSrc;};
    this.setOnClick = function (f) {onclickSrc = f;};
    this.setOnClickFunction = function (f) {onclick = f;};
    this.getMode = function () {return this.getConteiner() !== null ? this.getConteiner().getMode() : null;};
    
    var init = function () {
        label = document.createElement("a");
        
        conteudo = document.createElement("ul");
        conteudo.className = "jsdeMenuCaixa";
        
        elemento = document.createElement("li");
        elemento.className = "jsdeMenuItem";
        elemento.onclick = function (e) {
            e = e || event;
            return onclick.call(self, e);
        };
        elemento.appendChild(label);
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Texto",
            "descricao" : "Texto do menu",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getTexto",
            "set" : "setTexto",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Link",
            "descricao" : "Define uma URL para o Menu",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getLink",
            "set" : "setLink",
            "habilitado" : false
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Icone",
            "descricao" : "Icone do menu",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getIcone",
            "set" : "setIcone",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "NovoMenu",
            "descricao" : "Inclui um novo item ao menu",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Acao,
            "funcao" : "novoMenu",
            "habilitado" : true,
            "refresh" : true
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnClick",
            "descricao" : "Evento disparado quando o componente recebe um click do mouse",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnClick",
            "set" : "setOnClick",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.MenuItem, JSDialogEdit.Objeto);

/**
 * @class {class} JSDialogEdit.CampoOculto
 * Classe representando um Campo Oculto com todos os seus atributos.
 * @constructor JSDialogEdit.CampoOculto Cria um novo componente Campo Oculto (HTMLInputElement[type="hidden"]).
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Objeto
 */
JSDialogEdit.CampoOculto = function () {
    JSDialogEdit.Objeto.call(this);
    
    var self = this,
        propriedades = arguments[0],
        elemento = null,
        design = null,
        conteiner = null,
        valor = "",
        conector   = "",
        campo      = "",
        setId = this.setId;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.CampoOculto";
    
    /**
     * @function {String} toString
     * Retorna uma representa&ccedil;&atilde;o textual para o CampoOculto, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return texto representando o objeto
     */
    this.toString = function () {return this.CLASSE + "[#" + this.getId() + "]";};
    
    this.retornaListaConexaoXML = function (conexao) {
        if (conexao === undefined) conexao = conector;
        return conteiner.retornaListaConexaoXML(conexao);
    };
    
    this.retornaListaCampos = function (conexao) {
        if (conexao === undefined) conexao = conector;
        return conteiner.retornaListaCampos(conexao);
    };
    this.vincularDados = function () {
        if (conector !== "" && this.getCampo() !== "") {
            var valor = this.getObjetoConector().getValorCampo(this.getCampo());
            this.setValor(valor);
        }
    };
    
    this.getValor = function () {return valor;};
    this.setValor = function (v) {elemento.value = valor = v;};
    this.getElemento = function () {return elemento;};
    this.getElementoDesign = function () {return design;};
    this.getConteiner  = function () {return conteiner;};
    this.setConteiner  = function (v)  {conteiner = v;};
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function (v) {
        if (v === "") return;
        setId.call(this, v);
        elemento.name = v;
        elemento.id = v;
        design.id = v;
    };
    /**
     * @function {String} getConector
     * Retorna o ID do objeto {@link JSDialogEdit.Conexao} vinculado ao Componente
     * @return ID do JSDialogEdit.Conexao
     */
    this.getConector   = function ()  {return conector;};
    /**
     * @function {void} setConector
     * Define o ID do objeto {@link JSDialogEdit.Conexao} a ser vinculado ao Componente<br>
     * Quando for executado o m&eacute;todo {@link vincularDados} o Componente ira buscar os dados no Conector para exibi&ccedil;&atilde;o.
     * @param {String} id do objeto de Conexao
     */
    this.setConector   = function (id)  {conector = id; if (conector === "") this.setCampo("");};
    /**
     * @function {JSDialogEdit.Conexao} getObjetoConector
     * @return Objeto
     */
    this.getObjetoConector = function () {return conector === "" ? null : this.getConteiner().findFilho(conector);};
    /**
     * @function {String} getCampo
     * Retorna o nome do {@link JSDialogEdit.Conexao.Campo} de um objeto JSDialogEdit.Conexao vinculado ao Componente.
     * @return Nome do Campo
     */
    this.getCampo      = function ()  {return campo;};
    /**
     * @function {void} setCampo
     * Vincula o Componente ao {@link JSDialogEdit.Conexao.Campo} com o nome informado.<br>
     * <b>Aten&ccedil;&atilde;o!</b> Quando o Componente esta vinculado a um Campo, n&atilde;o &eacute; possivel definir o valor via <i>Editor</i>.
     * O Campo deve constar da lista de campos do objeto JSDialogEdit.Conexao tambem viculado ao Componente
     * @param {String} c Nome do campo a ser vinculado
     */
    this.setCampo      = function (c)  {
        this.setValor("");
        campo = c;
        if (elemento.value !== undefined) elemento.value = "[" + campo + "]";
        if (campo === "") this.setValor("");
    };
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };

    var init = function () {
        elemento = document.createElement("input");
        elemento.type = "hidden";
        design = document.createElement("img");
        design.src = JSDialogEdit.pastaImagens + "CampoOculto.png";
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Valor",
            "descricao" : "Valor do campo",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getValor",
            "set" : "setValor",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Conector",
            "descricao" : "Indica que o valor do componente virá de um Campo do elemento Conexao XML",
            "tipo" : JSDialogEdit.Propriedade.Tipos.ListaFuncao,
            "get" : "getConector",
            "set" : "setConector",
            "funcao" : "retornaListaConexaoXML",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Campo",
            "descricao" : "Indica de qual campo do elemento Conexao XML virá os dados",
            "tipo" : JSDialogEdit.Propriedade.Tipos.ListaFuncao,
            "get" : "getCampo",
            "set" : "setCampo",
            "funcao" : "retornaListaCampos",
            "habilitado" : true
        }));
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.CampoOculto, JSDialogEdit.Objeto);

/**
 * @class {class} JSDialogEdit.Conteiner
 * Classe base para componentes que podem conter outros componentes como por exemplo uma Janela, Menu ou Lista.
 * @constructor JSDialogEdit. Construtor base os componentes conteiners.
 * @param {String} elem Nome da Tag HTML que representara o objeto na p&aacute;gina.
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Componente
 */
JSDialogEdit.Conteiner = function (elem, prop) {
    JSDialogEdit.Componente.call(this, elem); //, prop);

    var self  = this,
        filhos = [],
        layout = JSDialogEdit.Conteiner.TiposLayout.NONE,
        toObject = this.toObject,
        toXml = this.toXml,
        setVisivel = this.setVisivel;

    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Conteiner";
    
    /**
     * @function {String} toString
     * Retorna uma representa&ccedil;&atilde;o textual para o Conteiner, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return texto representando o objeto
     */
    this.toString = function () {return this.CLASSE + "[#" + this.getId() + "]";};
    this.getLayout = function () {return layout;};
    this.setLayout = function (v) {
        var elemento = this.getElemento();
        layout = v;
        
        switch(v) {
            case JSDialogEdit.Conteiner.TiposLayout.SUPERIOR:
                elemento.style.position = "relative";
                elemento.style.cssFloat = "";
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "0px";
                elemento.style.left = "0px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Altura").habilitado = true;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.INFERIOR:
                elemento.style.position = "relative";
                elemento.style.cssFloat = "";
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "";
                elemento.style.left = "0px";
                elemento.style.bottom = "0px";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Altura").habilitado = true;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.CENTRO:
                elemento.style.position = "relative";
                elemento.style.cssFloat = "";
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "0px";
                elemento.style.left = "0px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = "100%";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Altura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.DIREITA:
                elemento.style.position = "relative";
                elemento.style.cssFloat = "right";
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "0px";
                elemento.style.left = "";
                elemento.style.bottom = "";
                elemento.style.right = "0px";
                elemento.style.width = this.getLargura() + "px";
                elemento.style.height = "100%";
                self.getPropriedade("Largura").habilitado = true;
                self.getPropriedade("Altura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.ESQUERDA:
                elemento.style.position = "relative";
                elemento.style.cssFloat = "left";
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "0px";
                elemento.style.left = "";
                elemento.style.bottom = "";
                elemento.style.right = "0px";
                elemento.style.width = this.getLargura() + "px";
                elemento.style.height = "100%";
                self.getPropriedade("Largura").habilitado = true;
                self.getPropriedade("Altura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.NONE:
            default:
                elemento.style.position = "absolute";
                elemento.style.cssFloat = "";
                elemento.style.MozBoxSizing = "";
                elemento.style.WebkitBoxSizing = "";
                elemento.style.boxSizing = "";
                elemento.style.top = this.getSuperior() + "px";
                elemento.style.left = this.getEsquerda() + "px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = this.getLargura() + "px";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = true;
                self.getPropriedade("Altura").habilitado = true;
                self.getPropriedade("Superior").habilitado = true;
                self.getPropriedade("Esquerda").habilitado = true;
                break;
        }
    };
    /**
     * @function {Array<JSDialogEdit.Componente>} getFilhos
     * Retorna um array de JSDialogEdit.Componente
     * @return Componentes inseridos no conteiner
     */
    this.getFilhos = function () {
        return filhos;
    };
    this.getFilho = function (id) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getId() == id) return filhos[x];
        }
        return null;
    };
    this.addFilho = function ___jsdialogedit_conteiner_addfilho(c) {
        c.setConteiner(this);
        
        if (c instanceof JSDialogEdit.Conexao) {
            filhos.unshift(c);
        } else if (c instanceof JSDialogEdit.MenuConteiner) {
            for(var x = 0; x < filhos.length; x++) {
                if (filhos[x] instanceof JSDialogEdit.MenuConteiner) throw "JSDialogEdit.Conteiner: Menu ja existe";
            }
            filhos.push(c);
        } else {
            filhos.push(c);
        }
        
        if (this[c.getId()] === undefined) this[c.getId()] = c;
    };
    this.removeFilho = function (c) {
        var id = c.getId();
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getId() == id) {
                filhos.splice(x, 1);
                delete this[id];
                break;
            }
        }
    };
    /**
     * @function {void} removeTodosFilhos
     * Remove todos os filhos do componente
     */
    this.removeTodosFilhos = function () {
        for(var x = 0; x < filhos.length; x++) {
            delete filhos[x];
        }
        filhos.length = 0;
    };
    /**
     * @function {JSDialogEdit.Objeto} findFilho
     * Localiza um Componente pelo ID independente de onde esteja na arvore de conteiners
     * @para {String} id Nome unico que identifica (ID) o componente a ser localizado
     */
    this.findFilho = function (id) {
        var c = this.getFilho(id);
        var chamador = arguments[1] || "";
        if (c === null) { 
            for(var x = 0; x < filhos.length; x++) {
                if (filhos[x].findFilho && filhos[x].getId() != chamador) {
                    c = filhos[x].findFilho(id, this.getId());
                    if (c !== null) break;
                }
            }
            
            if (c === null && this.getConteiner() !== null && this.getConteiner().getId() != chamador && !(this.getConteiner() instanceof JSDialogEdit.GerenciadorJanela)) {
                c = this.getConteiner().findFilho(id, this.getId());
            }
        }
        return c;
    };
    this.indexOf = function (c) {
        for(var x = 0; x < filhos.length; x++)
            if (filhos[x] === c) return x;
        return -1;
    };
    /**
     * @function {void} atualizaDados
     * Atualiza os dados exibidos pelo componente ap&oacute;s altera&ccedil;&atilde;o do compomente de Conexao vinculado
     */
    this.atualizaDados = function ___jsdialogedit_conteiner_atualizaDados(conexao) {
        for(var i = 0; i < filhos.length; i++) {
            if (filhos[i] instanceof JSDialogEdit.Conexao) {
                continue;
            } else if (filhos[i] instanceof JSDialogEdit.Conteiner || filhos[i] instanceof JSDialogEdit.PainelAbas) {
                filhos[i].atualizaDados(conexao);
            } else if (filhos[i] instanceof JSDialogEdit.Componente || filhos[i].atualizaDados) {
                if (!conexao || filhos[i].getConector() == conexao || (filhos[i].getFonteDados && filhos[i].getFonteDados() == conexao)) {
                    filhos[i].atualizaDados(conexao);
                }
            }
        }
    };
    this.vincularDados = function ___jsdialogedit_conteiner_vincularDados(conexao) {
        for(var i = 0; i < filhos.length; i++) {
            if (filhos[i] instanceof JSDialogEdit.Conexao) {
                continue;
            } else if (filhos[i] instanceof JSDialogEdit.Conteiner || filhos[i] instanceof JSDialogEdit.PainelAbas) {
                filhos[i].vincularDados(conexao);
            } else if (filhos[i] instanceof JSDialogEdit.Componente || filhos[i].vincularDados) {
                if (!conexao || filhos[i].getConector() == conexao || (filhos[i].getFonteDados && filhos[i].getFonteDados() == conexao)) {
                    filhos[i].vincularDados(conexao);
                }
            }
        }
    };
    this.setVisivel = function (v) {
        setVisivel.call(this, v);
        
        if(v === true && this.getMode() === "execucao") {
            for(var x = 0; x < filhos.length; x++) {
                if(filhos[x].repaint) {
                    filhos[x].repaint();
                }
            }
        }
    };
    this.repaint = function () {
        var x;
        for(x = 0; x < filhos.length; x++) {
            if(filhos[x].repaint) {
                filhos[x].repaint();
            }
        }
    };
    this.getMode = function () {
        if(this.getConteiner() === null) return null;
        return this.getConteiner().getMode();
    };
    /**
     * @function {JSONObject} toObject
     * Serializa o Objeto no formato JSON com os dados das Propriedades e Eventos da classe.
     * @return Objeto JSON com as informa&ccedil;&otilde;es.
     */
    this.toObject = function () {
        var saida = toObject.call(this);
        saida.filhos = [];
        
        for(var i = 0; i < filhos.length; i++) {
            saida.filhos.push(filhos[i].toObject());
        }
        
        return saida;
    };
    this.toXml = function (tag) {
        var xml = toXml.call(this, tag);
        var lstFilhos = document.createElementNS("http://code.google.com/p/jsdialogedit/", "Filhos");
        
        for(var i = 0; i < filhos.length; i++) {
            lstFilhos.appendChild(filhos[i].toXml());
        }
        
        xml.appendChild(lstFilhos);
        return xml;
    };
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var x = 0; x < filhos.length; x++) filhos[x].destroy();
        for(var item in this) {
            this[item] = null;
            delete this[item];
        }
        self = null;
        filhos = null;
        toObject = null;
        toXml = null;
    };
    
    var destroy = this.destroy;
    var init = function () {
        self.getPropriedade("Conector").habilitado = false;
        self.getPropriedade("Campo").habilitado = false;

        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Layout",
            "descricao" : "Layout do Componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getLayout",
            "set" : "setLayout",
            "habilitado" : true,
            "opcoes" : JSDialogEdit.Conteiner.TiposLayout
        }));
    };
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Conteiner, JSDialogEdit.Componente);

/** @struct {static final} TiposLayout
 * Lista est&aacute;tica com os layouts que um JSDialogEdit.Conteiner pode ter.
 * @draft Funcionalidade ainda n&atilde;o implementada.
 */
JSDialogEdit.Conteiner.TiposLayout = {NONE:"none", SUPERIOR:"superior", INFERIOR:"inferior", CENTRO:"centro", DIREITA:"direita", ESQUERDA:"esquerda"};

/**
 * @class {class} JSDialogEdit.Painel
 * Classe representando o mais simples dos conteiner para outros componentes.
 * @constructor JSDialogEdit.Painel Cria um novo componente Painel (HTMLDivElement).
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Conteiner
 */
JSDialogEdit.Painel = function () {
    JSDialogEdit.Conteiner.call(this, "div"); //, arguments[0]);
    
    var self = this,
        addFilho = this.addFilho,
        removeFilho = this.removeFilho,
        removeTodosFilhos = this.removeTodosFilhos,
        propriedades = arguments[0];
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Painel";
    
    this.addFilho = function (f) {
        addFilho.call(this, f);
        this.appendHTMLChild(f.getElemento());
    };
    
    /**
     * @function {void} removeFilho
     * Remove um Componente filho do conteiner
     * @param {JSDialogEdit.Componente} c Componente componente a ser retirado
     */
    this.removeFilho = function (c) {
        removeFilho.call(this, c);
        this.removeHTMLChild(c.getElemento());
    };
    
    this.removeTodosFilhos = function () {
        removeTodosFilhos.call(this);
        var filhos = this.getElemento().children;
        for(var x = filhos.length - 1; x >= 0; x--) {
            this.removeHTMLChild(filhos[x]);
        }
    };
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) delete this[item];
        self = null;
    };

    var init = function () {
        self.getElemento().style.border = "1px solid #000000";
        if (!propriedades || !propriedades.Altura) self.setAltura(100);
        if (!propriedades || !propriedades.Largura) self.setLargura(100);
        if (!propriedades || !propriedades.Estilo || !propriedades.Estilo.overflow) self.getElemento().style.overflow = "hidden";
        
        self.getPropriedade("Valor").habilitado = false;
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        self.getPropriedade("TabIndex").habilitado = false;
        self.getPropriedade("Tooltip").habilitado = false;
        self.getPropriedade("Desabilitado").habilitado = false;
        self.getEvento("OnFocus").habilitado = false;
        self.getEvento("OnBlur").habilitado = false;
        
        self.getElemento().style.padding = "0px";
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Painel, JSDialogEdit.Conteiner);

/**
 * @class {class} JSDialogEdit.Janela
 * Classe representando um conteiner do tipo Janela com todos os seus atributos.
 * @constructor JSDialogEdit.Janela Cria um novo componente Janela.
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Conteiner
 */
JSDialogEdit.Janela = function () {
    JSDialogEdit.Conteiner.call(this, "div"); //, arguments[0]);

    var self = this,
        propriedades = arguments[0] || null, elemento,
        divBarraTitulo, divIcone, divTitulo, divBotoes, divConteudo, divBarraStatus,
        btnMinimizar, btnMaxmizar, btnFechar, inicializando = false,
        form, action = "", titulo, icone = "", focoInicial = "",
        interna, divOverlay, tipoJanela, textoBarraStatus = "",
        larguraOld, alturaOld, esquerdaOld, superiorOld,
        camposInvalidos = [],
        gerenciador = null,
        gerenciadorJanelas = null,
        setId = this.setId,
        setLargura = this.setLargura,
        setAltura = this.setAltura,
        setVisivel = this.setVisivel,
        addFilho = this.addFilho,
        removeFilho = this.removeFilho,
        removeTodosFilhos = this.removeTodosFilhos,
        appendHTMLChild = this.appendHTMLChild,
        removeHTMLChild = this.removeHTMLChild,
        parseElemento = this.parseElemento,
        setZIndex = this.setZIndex,
        exibicao = JSDialogEdit.Janela.TiposExibicao.HIDDEN,
        acaoFechar = JSDialogEdit.Janela.AoFechar.HIDDEN,
        mode = "execucao",
        maximized = false,
        minimized = false,
        capturaEsc = false,
        ativa = false;

    var onFocusSrc = "";
    var onBlurSrc = "";
    var onResizeSrc = "";
    var onStateChangedSrc = "";
    var onCreateSrc = "";
    var onCloseSrc = "";
    var beforeSubmitSrc = "";
    var afterSubmitSrc = "";
    var errorSubmitSrc = "";

    var onFocus = function () {};
    var onBlur = function () {};
    var onStateChanged = function (state) {};
    var onCreate = function () {};
    var onClose = function (e) {};
    var beforeSubmit = function (e) {};
    var afterSubmit = function (retorno) {};
    var errorSubmit = function (mensagem, codigo) {};

    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto. */
    this.CLASSE = "JSDialogEdit.Janela";
    this.alturaMin = "20";
    this.larguraMin = "100";
    this.resultado = "";
    this.eventoPadrao = "OnCreate";
    /**
     * @event {delegate Function} onResize
     * Define a fun&ccedil;&atilde;o a ser executada apos o usuario redimensionar a Janela.
     * @param {Event} e Evento disparado pelo navegador.
     */
    this.onResize = function (e) {};
    /** @property {final String} JSDialogEdit.Janela.ICONE Icone padr&atilde;o para a Janela. */
    JSDialogEdit.Janela.ICONE = JSDialogEdit.pastaImagens + "icon_dialog_edit.png";
    
    this.setZIndex = function (v) {
        setZIndex.call(this, v);
        if (mode === "execucao" && tipoJanela === JSDialogEdit.Janela.TiposJanela.MODAL && divOverlay) {
            divOverlay.style.zIndex = v;
        }
    };
    this.setVisivel = function ___jsdialogedit_janela_setvisivel(v) {
        setVisivel.call(this, v);
        if (mode === "execucao" && tipoJanela === JSDialogEdit.Janela.TiposJanela.MODAL && divOverlay) {
            divOverlay.style.display = v ? "":"none";
            if(v) gerenciador.setFocus(self);
        }
    };
    /**
     * @function {void} setAltura
     * Define uma nova altura da janela, considerando a barra de titulo e de status, caso esteja visivel
     * @param {int} v Novo tamanho para a janela
     */
    this.setAltura = function ___jsdialogedit_janela_setaltura(v) {
        if (v < this.alturaMin) return false;
        setAltura.call(this, v);
        var status = 0;
        v -= divBarraTitulo.clientHeight;
        divConteudo.style.height = v + "px";
        if (JSDialogEdit.Core.getBrowser().indexOf("ie") == -1) {
            status = this.getBarraStatus() ? divBarraStatus.offsetHeight : 0;
            divConteudo.style.height = (v - status - (divConteudo.offsetHeight - v)) + "px";
        } else {
            status = this.getBarraStatus() ? divBarraStatus.clientHeight + parseInt(divBarraStatus.currentStyle.borderWidth, 10) * 2 : 0;
            divConteudo.style.height = (v - status) + "px";
            
            // alert("divConteudo.currentStyle = \n" + divConteudo.currentStyle);
            // alert("divConteudo.currentStyle.borderWidth = \n" + divConteudo.currentStyle.borderWidth);
            // alert("parseInt(divConteudo.currentStyle.borderWidth, 10) = \n" + parseInt(divConteudo.currentStyle.borderWidth, 10));
            // divConteudo.style.height = (v - status - parseInt(divConteudo.currentStyle.borderWidth, 10) * 2) + "px";
        }
        
        if (inicializando || (tipoJanela === JSDialogEdit.Janela.TiposJanela.MODAL && mode !== "edicao")) centraliza();
        return true;
    };
    /**
     * @function setLargura
     * Define uma nova largura da janela
     * @param {int} v Nova largura para a janela
     */
    this.setLargura = function ___jsdialogedit_janela_setlargura(v) {
        if (isNaN(v) || v < this.larguraMin) return;
        
        setLargura.call(this, v);
        divConteudo.style.width = v + "px";
        
        if (JSDialogEdit.Core.getBrowser().indexOf("ie") == -1) {
            divConteudo.style.width = (v - (divConteudo.offsetWidth - v)) + "px";
            divBarraStatus.style.width = "";
            divBarraStatus.style.width = (v - (divBarraStatus.offsetWidth - v)) + "px";
        } else {
            if (divConteudo.clientWidth === 0) return;
            divConteudo.style.width = (v - (v - divConteudo.clientWidth)) + "px";
        }
        
        if (tipoJanela === JSDialogEdit.Janela.TiposJanela.MODAL && mode !== "edicao") centraliza();
    };
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function ___jsdialogedit_janela_setid(v) {
        if (v === "") return;
        var oldId = this.getId();
        setId.call(this, v);
        divBarraTitulo.id = v + "_BarraTitulo";
        divBotoes.id = v + "_Botoes";
        divConteudo.id = v + "_Conteudo";
        divIcone.id = v + "_Icone";
        divTitulo.id = v + "_Titulo";
        form.id = v + "_form";
        
        if (titulo === "" || titulo == oldId) this.setTitulo(v);
    };
    /**
     * @function {String} getBarraStatusTexto
     * Retorna o texto sendo exibido na Barra de Status
     * @return Texto exibido na Barra de Status
     */
    this.getBarraStatusTexto = function ___jsdialogedit_janela_getBarraStatusTexto() {
        return textoBarraStatus;
    };
    /**
     * @function {void} setBarraStatusTexto
     * Define o texto a ser exibido na Barra de Status
     * @param Texto a ser exibido na Barra de Status
     */
    this.setBarraStatusTexto = function ___jsdialogedit_janela_setBarraStatusTexto(v) {
        divBarraStatus.innerHTML = textoBarraStatus = v;
    };
    this.getBarraStatus = function ___jsdialogedit_janela_getBarraStatus() {return divBarraStatus.style.display != "none";};
    this.setBarraStatus = function ___jsdialogedit_janela_setBarraStatus(v) {
        if(JSDialogEdit.trace === 2) JSDialogEdit.Core.trace();
        
        if (typeof v != "boolean") return;
        if (tipoJanela != JSDialogEdit.Janela.TiposJanela.NORMAL) v = false;
        if (v === this.getBarraStatus()) return;
        
        divBarraStatus.style.display = v ? "" : "none";
        this.setAltura(this.getAltura());
    };
    this.getTipoJanela = function ___jsdialogedit_janela_getTipoJanela() {return tipoJanela;};
    this.setTipoJanela = function ___jsdialogedit_janela_setTipoJanela(t) {
        t = parseInt(t, 10);
        tipoJanela = t;
        
        elemento.className = elemento.className.replace(" jsdeJanelaNormal", "");
        elemento.className = elemento.className.replace(" jsdeJanelaDialog", "");
        elemento.className = elemento.className.replace(" jsdeJanelaModal", "");
        
        switch(t) {
            case JSDialogEdit.Janela.TiposJanela.NORMAL:
                elemento.className += " jsdeJanelaNormal";
                divBarraTitulo.ondblclick = maxmizar;
                this.larguraMin = "100";
                divBarraTitulo.className = "jsdeJanelaBarraTitulo";
                capturaEsc = false;
                JSDialogEdit.Core.removeEvento(window, "keypress", handlerTeclado);
                JSDialogEdit.Core.removeEvento(window, "keyup", handlerTeclado);
                this.setRedimensionavel(true);
                if (gerenciador !== null) {
                    gerenciador.ordenarJanelas();
                    if (divOverlay) removeOverlay();
                }
                break;
            case JSDialogEdit.Janela.TiposJanela.DIALOG:
                elemento.className += " jsdeJanelaDialog";
                this.setBarraStatus(false);
                divBarraTitulo.ondblclick = null;
                this.larguraMin = "20";
                divBarraTitulo.className = "jsdeJanelaBarraTitulo_dialog";
                capturaEsc = false;
                JSDialogEdit.Core.removeEvento(window, "keypress", handlerTeclado);
                JSDialogEdit.Core.removeEvento(window, "keyup", handlerTeclado);
                if (mode !== "edicao") this.setRedimensionavel(false);
                if (gerenciador !== null) {
                    gerenciador.ordenarJanelas();
                    if (divOverlay) removeOverlay();
                }
                break;
            case JSDialogEdit.Janela.TiposJanela.MODAL:
                elemento.className += " jsdeJanelaModal";
                this.setBarraStatus(false);
                divBarraTitulo.ondblclick = null;
                this.larguraMin = "100";
                divBarraTitulo.className = "jsdeJanelaBarraTitulo_dialog";
                if (mode !== "edicao") this.setRedimensionavel(false);
                if (!capturaEsc && mode === "execucao") {
                    capturaEsc = true;
                    if (JSDialogEdit.Core.getBrowser().indexOf("gecko") != -1) {
                        JSDialogEdit.Core.capturaEvento(window, "keypress", handlerTeclado);
                    } else {
                        JSDialogEdit.Core.capturaEvento(window, "keyup", handlerTeclado);
                    }
                }
                if (gerenciador !== null) {
                    this.setZIndex(1000);
                    if (!divOverlay) adicionaOverlay();
                }
                if (mode !== "edicao") centraliza();
                break;
        }
    };
    /**
     * @function {String} getIcone
     * Retorna o caminho do icone exibido na Janela.
     * @return URL da imagem que esta sendo exibida como icone pela Janela.
     */
    this.getIcone = function () {return icone;};
    /**
     * @function {void} setIcone
     * Define o caminho do icone exibido na Janela.
     * @param {String} v URL da imagem que esta sendo exibida como icone pela Janela.
     */
    this.setIcone = function (v) {
        icone = v;
        divIcone.style.backgroundImage = v !== "" ? "url(" + v + ")" : "url(" + JSDialogEdit.Janela.ICONE + ")";
    };
    /**
     * @function {String} getTitulo
     * Retorna o titulo da Janela
     * @return Texto exibido na Barra de Titulo da Janela
     */
    this.getTitulo = function () {return titulo;};
    /**
     * @function {void} setTitulo
     * Define o titulo da Janela
     * @param {String} v Texto a ser exibido na Barra de Titulo
     */
    this.setTitulo = function (v) {titulo = v;divTitulo.innerHTML = v;divTitulo.title = v;};
    /**
     * @function {String} getConteudo
     * Define o conteudo da Janela
     * @return Conteudo da Janela
     */
    this.getConteudo = function () {return divConteudo.innerHTML;};
    this.setConteudo = function (v) {divConteudo.innerHTML = v;};
    /**
     * @function {void} setExibicao
     * Define a forma de exibi&ccedil;&atilde;o do conteudo da Janela.
     * @param {JSDialogEdit.Janela.TiposExibicao} v Tipo de Exibi&ccedil;&atilde;o.
     */
    this.setExibicao = function (v) {
        exibicao = v;
        
        switch(v) {
            case JSDialogEdit.Janela.TiposExibicao.VERTICAL:
                divConteudo.style.overflow = 'hidden';
                divConteudo.style.overflowX = 'hidden';
                divConteudo.style.overflowY = 'auto';
                break;
            case JSDialogEdit.Janela.TiposExibicao.HORIZONTAL:
                divConteudo.style.overflow = 'hidden';
                divConteudo.style.overflowY = 'hidden';
                divConteudo.style.overflowX = 'auto';
                break;
            case JSDialogEdit.Janela.TiposExibicao.AUTO:
            case JSDialogEdit.Janela.TiposExibicao.HIDDEN:
            case JSDialogEdit.Janela.TiposExibicao.SCROLL:
            case JSDialogEdit.Janela.TiposExibicao.VISIBLE:
            default:
                divConteudo.style.overflowX = '';
                divConteudo.style.overflowY = '';
                divConteudo.style.overflow = v;
                break;
        }
    };
    /**
     * @function {JSDialogEdit.Janela.TiposExibicao} getExibicao
     * Retorna a forma de exibi&ccedil;&atilde;o do conteudo da Janela.
     * @return Tipo de Exibi&ccedil;&atilde;o.
     */
    this.getExibicao = function () {return exibicao;};
    this.setAcaoFechar = function (v) {acaoFechar = parseInt(v, 10);};
    this.getAcaoFechar = function () {return acaoFechar;};
    this.setAction = function (v) {action = v;};
    this.getAction = function () {return action;};
    this.getFocoInicial = function () {return focoInicial;};
    this.setFocoInicial = function (v) {
        if (v instanceof JSDialogEdit.Componente) v = v.getId();
        if (typeof v !== "string") return;
        focoInicial = v;
    };
    
    /**
     * @function {String} getOnCreate
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando a janela for criada.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnCreate     = function () {return onCreateSrc;};
    /**
     * @function {void} setOnCreate
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando a janela for criada.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.setOnCreate     = function (f) {onCreateSrc     = f;};
    /**
     * @function {String} getOnClose
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando a Janela for fechada.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnClose      = function () {return onCloseSrc;};
    /**
     * @function {void} setOnClose
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando a Janela for fechada.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.setOnClose      = function (f) {onCloseSrc      = f;};
    this.getBeforeSubmit = function () {return beforeSubmitSrc;};
    this.setBeforeSubmit = function (f) {beforeSubmitSrc = f;};
    this.getAfterSubmit  = function () {return afterSubmitSrc;};
    this.setAfterSubmit  = function (f) {afterSubmitSrc  = f;};
    this.getErrorSubmit  = function () {return errorSubmitSrc;};
    this.setErrorSubmit  = function (f) {errorSubmitSrc  = f;};
    /**
     * @function {String} getOnFocus
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando a Janela receber o foco.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnFocus     = function () {return onFocusSrc;};
    /**
     * @function {void} setOnFocus
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando a Janela receber o foco.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.setOnFocus     = function (f) {onFocusSrc = f;};
    /**
     * @function {String} getOnBlur
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando a Janela perder o foco do teclado.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.getOnBlur      = function () {return onBlurSrc;};
    /**
     * @function {void} setOnBlur
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando a Janela perder o foco do teclado.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.setOnBlur      = function (f) {onBlurSrc = f;};
    /**
     * @function {String} getOnResize
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando a Janela for redimensionada pelo usuario.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.getOnResize    = function () {return onResizeSrc;};
    /**
     * @function {void} setOnResize
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando a Janela for redimensionada pelo usuario.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.setOnResize    = function (f) {onResizeSrc = f;};
    /**
     * @function {String} getOnStateChanged
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o
     * estado da Janela for alterado entre Minimizado, Maxmizado e Restaurado.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnStateChanged = function () {return onStateChangedSrc;};
    /**
     * @function {void} setOnStateChanged
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada quando o
     * estado da Janela for alterado entre Minimizado, Maxmizado e Restaurado.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f c&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.setOnStateChanged = function (f) {onStateChangedSrc = f;};
    
    this.setOnCreateFunction       = function (f) {onCreate       = f;};
    this.setOnCloseFunction        = function (f) {onClose        = f;};
    this.setBeforeSubmitFunction   = function (f) {beforeSubmit   = f;};
    this.setAfterSubmitFunction    = function (f) {afterSubmit    = f;};
    this.setErrorSubmitFunction    = function (f) {errorSubmit    = f;};
    this.setOnFocusFunction        = function (f) {onFocus        = f;};
    this.setOnBlurFunction         = function (f) {onBlur         = f;};
    this.setOnResizeFunction       = function (f) {this.onResize  = f;};
    this.setOnStateChangedFunction = function (f) {onStateChanged = f;};
    
    this.setMode = function (v) {
        mode = v;
        if (mode == "edicao") {
            divConteudo.style.backgroundImage = "url(" + JSDialogEdit.pastaImagens + "grid.png)";
            removeOverlay();
            this.setRedimensionavel(true);
            JSDialogEdit.Core.removeEvento(window, "keypress", handlerTeclado);
        } else {
            divConteudo.style.backgroundImage = "";
        }
    };
    this.getMode = function () {return mode;};
    
    this.setAtiva = function (v, cancelBubble) {
        if(cancelBubble !== true && gerenciador != null) {
            gerenciador.setFocus(this);
            return;
        }
        
        if (v) {
            if(onFocus.call(this) === false) return;
            elemento.className = elemento.className.replace(" jsdeJanelaInativa", "");
            elemento.className = elemento.className.replace(" jsdeJanelaAtiva", "");
            elemento.className += " jsdeJanelaAtiva";
            if (!ativa) setFoco();
        } else {
            if(ativa) if(onBlur.call(this) === false) return;
            elemento.className = elemento.className.replace(" jsdeJanelaInativa", "");
            elemento.className = elemento.className.replace(" jsdeJanelaAtiva", "");
            elemento.className += " jsdeJanelaInativa";
        }
        
        ativa = v;
    };
    this.setGerenciador = function (v){
        if (v === null || v instanceof JSDialogEdit.GerenciadorJanela) {
            if (v === gerenciador)  return;
            if (gerenciador !== null) gerenciador.removeFilho(this);
            gerenciador = v;
            if (v !== null) centraliza();
        } else {
            throw "JSDialogEdit.Janela: InvalidGerenciadorException";
        }
    };
    this.isMaximized = function () {return maximized;};
    this.isMinimized = function () {return minimized;};
    
    /**
     * @function {void} addFilho
     * Adiciona um Componente filho na Janela
     * @param {JSDialogEdit.Componente} f Componente a ser adicionado
     */
    this.addFilho = function (f) {
        addFilho.call(this, f);
        if (f instanceof JSDialogEdit.Janela) {
            if (gerenciadorJanelas === null) {
                gerenciadorJanelas = new JSDialogEdit.GerenciadorJanela();
                gerenciadorJanelas.setConteiner(divConteudo);
            }
            
            f.setGerenciador(null);
            gerenciadorJanelas.addFilho(f);
            f.getElemento().style.position = "absolute";
        }
        
        if (f instanceof JSDialogEdit.MenuConteiner) {
            divConteudo.insertBefore(f.getElemento(), divConteudo.firstChild);
        } else {
            if (mode == "execucao") {
                divConteudo.appendChild(f.getElemento());
            } else {
                divConteudo.appendChild(f.getElementoDesign());
            }
        }
    };
    /**
     * @function {void} removeFilho
     * Remove um Componente filho da Janela
     * @param {JSDialogEdit.Componente} c componente a ser retirado
     */
    this.removeFilho = function (c) {
        removeFilho.call(this, c);
        if (mode == "execucao") {
            divConteudo.removeChild(c.getElemento());
        } else {
            divConteudo.removeChild(c.getElementoDesign());
        }
    };
    this.removeTodosFilhos = function () {
        removeTodosFilhos.call(this);
        for(var x = divConteudo.children.length - 1; x >= 0; x--) {
            divConteudo.removeChild(divConteudo.children[x]);
        }
    };

    /**
     * @function {void} appendHTMLChild
     * Adiciona um elemento HTML ao Componente
     */
    this.appendHTMLChild = function (child) {
        divConteudo.appendChild(child);
    };
    /**
     * @function {void} removeHTMLChild
     * Remove um elemento HTML ao Componente
     */
    this.removeHTMLChild = function (child) {
        divConteudo.removeChild(child);
    };
    
    this.retornaListaConexaoXML = function () {
        var lst = this.getFilhos();
        var retorno = {"":""};
        var item;
        
        for(var x = 0; x < lst.length; x++) {
            if (lst[x] instanceof JSDialogEdit.Conexao) {
                item = lst[x].getId();
                retorno[item] = item;
            }
        }
        
        return retorno;
    };
    
    this.retornaListaCampos = function (conector) {
        var retorno, conn, campos, x;
        retorno = {"":""};
        if (conector === "") return retorno;
        conn = this.getFilho(conector);
        if (conn === null) return retorno;
        campos = conn.getCampos();
        for(x = 0; x < campos.length; x++) {
            retorno[campos[x].getId()] = campos[x].getId();
        }
        
        return retorno;
    };
    
    this.executar = function ___jsdialogedit_janela_executar() {
        inicializaFilhos(this.getFilhos());
        this.vincularDados();
        onCreate.call(self);
        setFoco();
    };
    
    this.getListaReferencia = function () {
        var retono = {"-":""};
        for(var i = 0; i < form.length; i++) {
            if (form[i].tagName.toUpperCase() == "SELECT" || form[i].tagName.toUpperCase() == "TEXTAREA" || (form[i].type && form[i].type.toUpperCase() == "TEXT")) {
                retono[form[i].id] = [form[i].id];
            }
        }
        
        return retono;
    };
    /**
     * @function {void} centralizar
     * Centraliza a Janela dentro do seu Conteiner.
     */
    this.centralizar = function () {centraliza();};
    /**
     * @function {void} parseElemento
     * Utilizado internamente para processar os c&oacute;digos fonte gerados pelo Editor.
     * Realiza o processamento deste Componente em um elemento DOM.HTMLElement, podendo assim ser inserido em uma p&aacute;gina.
     */
    this.parseElemento = function ___jsdialogedit_janela_parseElemento() {
        parseElemento.call(this);
        form.action  = action;
        
        onCreate       = new Function(this.getOnCreate());
        onClose        = new Function("e", this.getOnClose());
        beforeSubmit   = new Function("e", this.getBeforeSubmit());
        afterSubmit    = new Function("retorno", this.getAfterSubmit());
        errorSubmit    = new Function("mensagem", "codigo", this.getErrorSubmit());
        onStateChanged = new Function("state", this.getOnStateChanged());
        this.onResize  = new Function("e", this.getOnResize());
    };
    
    /**
     * @function {String} toString
     * Retorna uma representa&ccedil;&atilde;o textual para a Janela, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return texto representando o objeto
     */
    this.toString = function () {return this.CLASSE + "[#" + this.getId() + "]";};
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in this) {
            this[item] = null;
            delete this[item];
        }
        self = null;
    };
    this.fechar = function () {fechar(null);};
    this.submit = function () {submit(null);};
    
    var inicializaFilhos = function (itens) {
        for(var i = 0; i < itens.length; i++) {
            if (itens[i] instanceof JSDialogEdit.Botao && itens[i].getTipo() == JSDialogEdit.Botao.TiposBotao.CANCELAR) {
                JSDialogEdit.Core.capturaEvento(itens[i].getElemento(), "click", fechar);
                
                // TODO Realmente necessario? Quando chama setTipoJanela(MODAL) ja faz isso
                /*if (!capturaEsc && tipoJanela === JSDialogEdit.Janela.TiposJanela.MODAL) {
                    capturaEsc = true;
                    if (JSDialogEdit.Core.getBrowser().indexOf("gecko") != -1) {
                        JSDialogEdit.Core.capturaEvento(window, "keypress", handlerTeclado);
                    } else {
                        JSDialogEdit.Core.capturaEvento(window, "keyup", handlerTeclado);
                    }
                }*/
            } else if (itens[i] instanceof JSDialogEdit.Conteiner || itens[i] instanceof JSDialogEdit.PainelAbas) {
                inicializaFilhos(itens[i].getFilhos());
            }
        }
    };
    
    var adicionaOverlay = function () {
        if (mode == "edicao") return;
        divOverlay = document.createElement("div");
        divOverlay.className = "jsdeJanelaOverlay";
        if (self.getElemento().parentNode !== document.body) divOverlay.style.position = "absolute";
        self.getConteiner().getConteiner().insertBefore(divOverlay, self.getElemento());
    };
    
    var removeOverlay = function () {
        if (!divOverlay) return;
        self.getConteiner().getConteiner().removeChild(divOverlay);
        divOverlay = null;
    };
    
    var fechar = function (e) {
        if (!e) if (typeof event != "undefined") e = event;
        if (onClose.call(self, e) === false) return false;
        
        switch(acaoFechar) {
            case JSDialogEdit.Janela.AoFechar.HIDDEN:
                self.setVisivel(false);
                break;
            case JSDialogEdit.Janela.AoFechar.DESTROY:
                self.getConteiner().removeFilho(self);
                JSDialogEdit.Core.removeEvento(window, "keypress", handlerTeclado);
                JSDialogEdit.Core.removeEvento(window, "keyup", handlerTeclado);
                removeOverlay();
                break;
            case JSDialogEdit.Janela.AoFechar.NOTHING:
                return true;
            default:
                break;
        }
        
        return true;
    };
    
    var maxmizar = function () {
        if(maximized) return;
        
        maximized = true;
        minimized = false;
        self.getElemento().className = self.getElemento().className.replace(/ jsdeJanelaMinimizada/g, "");
        
        esquerdaOld = esquerdaOld ? esquerdaOld : self.getEsquerda();
        superiorOld = superiorOld ? superiorOld : self.getSuperior();
        alturaOld   = alturaOld   ? alturaOld   : self.getAltura();
        larguraOld  = larguraOld  ? larguraOld  : self.getLargura();
        
        self.setEsquerda(0);
        self.setSuperior(0);
        self.setAltura(document.body.clientHeight - 4);
        self.setLargura(document.body.clientWidth - 4);
        self.setRedimensionavel(false);
        self.setArrastavel(false);
        
        divBarraTitulo.ondblclick = restaurar;
        btnMaxmizar.onclick = restaurar;
        btnMaxmizar.className = "jsdeJanelaBotaoRestaurar";
        btnMinimizar.style.display = "";
        
        onStateChanged.call(self, 'MAXIMIZED');
    };
    
    var restaurar = function () {
        if(!maximized && !minimized) return;
        
        maximized = false;
        minimized = false;
        self.getElemento().className = self.getElemento().className.replace(/ jsdeJanelaMinimizada/g, "");
        
        self.setEsquerda(esquerdaOld);
        self.setSuperior(superiorOld);
        self.setLargura(larguraOld);
        self.setAltura(alturaOld);
        self.setRedimensionavel(true);
        self.setArrastavel(true);
        
        divBarraTitulo.ondblclick = maxmizar;
        btnMaxmizar.onclick = maxmizar;
        btnMaxmizar.className = "jsdeJanelaBotaoMaxmizar";
        btnMinimizar.style.display = "";
        
        esquerdaOld = null;
        superiorOld = null;
        larguraOld  = null;
        alturaOld   = null;
        
        onStateChanged.call(self, 'RESTORED');
    };
    
    var minimizar = function () {
        if(minimized) return;
        
        maximized = false;
        minimized = true;
        self.getElemento().className += " jsdeJanelaMinimizada";
        if (alturaOld) {
            divBarraTitulo.ondblclick = maxmizar;
            btnMaxmizar.onclick = maxmizar;
            btnMaxmizar.className = "jsdeJanelaBotaoMaxmizar";
        } else {
            divBarraTitulo.ondblclick = restaurar;
            btnMaxmizar.onclick = restaurar;
            btnMaxmizar.className = "jsdeJanelaBotaoRestaurar";
        }
        
        esquerdaOld = esquerdaOld ? esquerdaOld : self.getEsquerda();
        superiorOld = superiorOld ? superiorOld : self.getSuperior();
        alturaOld   = alturaOld   ? alturaOld   : self.getAltura();
        larguraOld  = larguraOld  ? larguraOld  : self.getLargura();
        
        self.setRedimensionavel(false);
        self.setArrastavel(false);
        self.setEsquerda(1);
        self.setSuperior(document.body.clientHeight - self.alturaMin);
        self.setAltura(self.alturaMin);
        self.setLargura(self.larguraMin);
        
        onStateChanged.call(self, 'MINIMIZED');
    };
    
    var submit = function (e) {
        if (!e) if (typeof event != "undefined") e = event;
        
        for(var x = 0; x < camposInvalidos.length; x++) camposInvalidos[x].className = camposInvalidos[x].className.replace(" jsdeErroPreenchimento", "");
        camposInvalidos = [];
        
        if (!validaCamposObrigatorios()) {
            errorSubmit.call(self, camposInvalidos, -1);
            return false;
        }
        
        if (beforeSubmit.call(self, e) === false) return false;
        
        var ajax = new JSDialogEdit.Ajax();
        if (action !== "") {
            ajax.request({
                "url":action,
                "tipoRequisicao":"POST",
                "form":form,
                "metodo":function (retorno) {
                    self.resultado = retorno;
                    afterSubmit.call(self, retorno);
                    fechar(e);
                },
                "erro":function (retorno, codigo) {
                    errorSubmit.call(self, retorno, codigo);
                }
            });
        } else {
            afterSubmit.call(self, null);
            fechar(e);
        }
        
        return false;
    };
    
    var handlerTeclado = function (e) {
        if (mode !== "execucao") return;
        e = e || event;
        var key = e.keyCode;
        
        // ESC
        if (key == 27) fechar(e);
    };
    
    var validaCamposObrigatorios = function () {
        var lstCampos = [];
        var x;
        
        if (form.getElementsByClassName) {
            lstCampos = form.getElementsByClassName("jsdePreenchimentoObrigatorio");
        } else {
            for(x = 0; x < form.length; x++) {
                if (form.elements[x].className.indexOf("jsdePreenchimentoObrigatorio") != -1) lstCampos.push(form.elements[x]);
            }
        }
        
        for(x = 0; x < lstCampos.length; x++) {
            if (typeof lstCampos[x].value != "undefined" && lstCampos[x].value === "") {
                lstCampos[x].className += " jsdeErroPreenchimento";
                camposInvalidos.push(lstCampos[x]);
            }
        }
        return camposInvalidos.length === 0;
    };
    
    var centraliza = function () {
        // http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
        var px, py, conteiner, visivel = self.getVisivel();
        
        if (!visivel) self.setVisivel(true);
        
        conteiner = self.getElemento().parentNode;
        if (conteiner === document.body) {
            if (typeof window.innerWidth != "undefined" && window.innerWidth !== 0) {
                px = parseInt((window.innerWidth - self.getLargura())/2, 10);
                py = parseInt((window.innerHeight - self.getAltura())/2, 10);
            } else if (typeof document.documentElement != "undefined" && document.documentElement.clientWidth !== 0) {
                px = parseInt((document.documentElement.clientWidth - self.getLargura())/2, 10);
                py = parseInt((document.documentElement.clientHeight - self.getAltura())/2, 10);
            } else {
                px = 0;
                py = 0;
            }
        } else {
            px = parseInt((conteiner.clientWidth - self.getLargura()) / 2, 10);
            py = parseInt((conteiner.clientHeight - self.getAltura()) / 2, 10);
        }
        
        if(px < 0) px = 0;
        if(py < 0) py = 0;
        
        self.setEsquerda(px);
        self.setSuperior(py);
        self.setVisivel(visivel);
    };
    
    var setFoco = function () {
        if (mode == "edicao") return;
        if (focoInicial !== "") {
            for(var i = 0; i < form.length; i++) {
                if (form[i].id == focoInicial) form[i].focus();
            }
        }
    };
    
    var init = function () {
        elemento = self.getElemento();
        
        inicializando = true;
        titulo = "";
        if (!propriedades || !propriedades.Tipo) tipoJanela = JSDialogEdit.Janela.TiposJanela.NORMAL;
        interna = true;
        
        divBarraStatus = document.createElement("div");
        divBarraStatus.className = "jsdeJanelaBarraStatus";
        divBarraStatus.style.display = "none";

        divIcone = document.createElement("div");
        divIcone.className = "jsdeJanelaIcone";
        divIcone.style.backgroundImage = "url(" + JSDialogEdit.Janela.ICONE + ")";
        divIcone.ondblclick = fechar;

        divTitulo = document.createElement("div");
        divTitulo.className = "jsdeJanelaTitulo";
        divTitulo.innerHTML = "Sem Titulo";

        btnFechar = document.createElement("div");
        btnFechar.className = "jsdeJanelaBotaoFechar";
        btnFechar.onclick = fechar;

        btnMaxmizar = document.createElement("div");
        btnMaxmizar.className = "jsdeJanelaBotaoMaxmizar";
        btnMaxmizar.onclick = maxmizar;

        btnMinimizar = document.createElement("div");
        btnMinimizar.className = "jsdeJanelaBotaoMinimizar";
        btnMinimizar.onclick = minimizar;

        divBotoes = document.createElement("div");
        divBotoes.className = "jsdeJanelaBotoes";
        divBotoes.appendChild(btnMinimizar);
        divBotoes.appendChild(btnMaxmizar);
        divBotoes.appendChild(btnFechar);

        divBarraTitulo = document.createElement("div");
        divBarraTitulo.className = "jsdeJanelaBarraTitulo";
        divBarraTitulo.ondblclick = maxmizar;
        self.registraEvento("mousedown", function (){JSDialogEdit.dragComp = self;}, divBarraTitulo);
        
        divBarraTitulo.appendChild(divIcone);
        divBarraTitulo.appendChild(divBotoes);
        divBarraTitulo.appendChild(divTitulo);

        divConteudo = document.createElement("div");
        divConteudo.className = "jsdeJanelaConteudo";
        divConteudo.style.overflow = exibicao;

        form = document.createElement("form");
        form.action = "";
        form.onsubmit = submit;
        form.appendChild(divConteudo);
        
        self.setClassName("jsdeJanela");
        self.setId("Janela" + (new Date()).getTime());
        self.setArrastavel(true);
        self.setRedimensionavel(true);
        self.setTipoJanela(JSDialogEdit.Janela.TiposJanela.NORMAL);

        JSDialogEdit.Core.disableSelection(self.getElemento());
        JSDialogEdit.Core.disableSelection(divBarraTitulo);
        
        self.registraEvento("mousedown", function (e){
            e = e || event;
            var _target = e.target || e.srcElement;
            gerenciador.setFocus(self);
        });
        
        appendHTMLChild(divBarraTitulo);
        appendHTMLChild(form);
        appendHTMLChild(divBarraStatus);
        
        if (!window.JSDEGerenciadorJanela) window.JSDEGerenciadorJanela = new JSDialogEdit.GerenciadorJanela();
        window.JSDEGerenciadorJanela.addFilho(self);
        
        self.setAltura(300);
        self.setLargura(300);
        centraliza();
        
        self.getPropriedade("Valor").habilitado = false;
        self.getPropriedade("Tooltip").habilitado = false;
        self.getPropriedade("Superior").habilitado = false;
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Esquerda").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        self.getPropriedade("Classe").habilitado = false;
        self.getPropriedade("Estilos").habilitado = false;
        self.getPropriedade("TabIndex").habilitado = false;
        self.getPropriedade("Desabilitado").habilitado = false;
        self.getPropriedade("Visivel").habilitado = false;
        self.getPropriedade("Layout").habilitado = false;
        self.getEvento("OnMouseOver").habilitado = false;
        self.getEvento("OnMouseOut").habilitado = false;
        self.getEvento("OnMouseDown").habilitado = false;
        self.getEvento("OnMouseUp").habilitado = false;
        self.getEvento("OnMouseMove").habilitado = false;
        self.getEvento("OnClick").habilitado = false;

        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Status",
            "descricao" : "Barra de status",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getBarraStatus",
            "set" : "setBarraStatus",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Tipo",
            "descricao" : "Define como uma janela sera exibida",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getTipoJanela",
            "set" : "setTipoJanela",
            "opcoes" : JSDialogEdit.Janela.TiposJanela,
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Titulo",
            "descricao" : "Define o titulo da janela",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getTitulo",
            "set" : "setTitulo",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Action",
            "descricao" : "Define a URL de destino do formulario",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getAction",
            "set" : "setAction",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "AcaoFechar",
            "descricao" : "Define o comportamento da janela ao ser fechada",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getAcaoFechar",
            "set" : "setAcaoFechar",
            "opcoes" : JSDialogEdit.Janela.AoFechar,
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Exibicao",
            "descricao" : "Define com o conteudo da janela sera exibido",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getExibicao",
            "set" : "setExibicao",
            "opcoes" : JSDialogEdit.Janela.TiposExibicao,
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Icone",
            "descricao" : "Define o icone da janela",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getIcone",
            "set" : "setIcone",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "FocoInicial",
            "descricao" : "Componente que recebera o foco quando a Janela for exibida",
            "tipo" : JSDialogEdit.Propriedade.Tipos.ListaFuncao,
            "get" : "getFocoInicial",
            "set" : "setFocoInicial",
            "funcao" : "getListaReferencia",
            "habilitado" : true
        }));

        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnCreate",
            "descricao" : "Evento ocorrido logo que a janela for criada",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnCreate",
            "set" : "setOnCreate",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : ""
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnClose",
            "descricao" : "Evento ocorrido antes da Janela ser fechada",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnClose",
            "set" : "setOnClose",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnResize",
            "descricao" : "Evento ocorrido quando o usuario redimensionar a Janela",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnResize",
            "set" : "setOnResize",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : "Event e"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnStateChanged",
            "descricao" : "Evento ocorrido quando o estado da Janela for alterado",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnStateChanged",
            "set" : "setOnStateChanged",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : "String state"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "BeforeSubmit",
            "descricao" : "Evento ocorrido antes que o formulario seja enviado",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getBeforeSubmit",
            "set" : "setBeforeSubmit",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "AfterSubmit",
            "descricao" : "Evento ocorrido logo apos o servidor responder ao envio do formulario",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getAfterSubmit",
            "set" : "setAfterSubmit",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : "String retorno"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "ErrorSubmit",
            "descricao" : "Evento ocorrido caso o servidor retorne erro pelo envio do formulario",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getErrorSubmit",
            "set" : "setErrorSubmit",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : "String mensagem, String codigo"
        }));

        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
        
        inicializando = false;
    };
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Janela, JSDialogEdit.Conteiner);

/**
 * @function {static JSDialogEdit.Janela} Mensagem
 * M&eacute;todo est&aacute;tico que permite exibir uma janela de alerta para o usu&aacute;rio
 * @param {JSONObject} parametros {@link JSONObject} com o nome/valor para as seguintes propriedades:
 * <ul>
 * <li>{string}   mensagem Mensagem a ser exibida.</li>
 * <li>{string}   pergunta Pergunta a ser exibida no lugar da Mensagem. Neste caso um caixa de texto tambem ser&aacute; exibida.</li>
 * <li>{string}   resposta Resposta padr&atilde;o a ser exibida na caixa de texto, quando enviada uma pergunta.</li>
 * <li>{string}   titulo   Titulo da janela.</li>
 * <li>{string}   icone    URL do icone a ser exibido na janela. Caso seja informada uma pergunta, e nenhum icone for informado,
 *                         um icone de <i>?</i> ser&aacute; exibido por padr&atilde;o.</li>
 * <li>{Function} retorno  Fun&ccedil;&atilde;o a ser chamada quando o usu&aacute;rio clicar em um bot&atilde;o ou fechar a janela.
 *                         A fun&ccedil;&atilde;o receber&aacute; como parametro o texto do bot&atilde;o clicado ou <i>null</i>.
 *                         No caso de ser uma pergunta, alem do botatilde;o o segundo parametro ser&aacute; a resposta
 *                         informada pelo usuario.</li>
 * <li>{Array}    botoes   Lista com os textos a serem exibidos nos botoes da janela.</li>
 * </ul>
 * @return {JSDialogEdit.Janela} Rerferencia a Janela modal exibida ao usu&aacute;rio.
 */
JSDialogEdit.Janela.Mensagem = function (parametros) {
    var i, jnl, conteudo, lst, favicon, id, tbl, linhaResposta, colunaResposta, txtResposta, largura, fnc = function (){};
    if (!parametros) return;
    if (parametros.mensagem === undefined && parametros.pergunta === undefined) return;
    if (parametros.titulo === undefined) parametros.titulo = document.title !== "" ? document.title : document.location.host;
    if (!parametros.botoes) parametros.botoes = ["Ok"];
    if (parametros.retorno) fnc = function () {
        var botao = this.getValor();
        if(txtResposta === undefined) {
            parametros.retorno(botao);
        } else {
            parametros.retorno(botao, txtResposta.getValor());
        }
        jnl.setOnCloseFunction(function(){});
    };
    id = (new Date()).getTime();
    
    for(i = 0; i < parametros.botoes.length; i++) {
        parametros.botoes[i] = new JSDialogEdit.Botao({
            "ID"    : "btnMensagem" + id + "_" + i,
            "Valor" : parametros.botoes[i],
            "Tipo"  : JSDialogEdit.Botao.TiposBotao.ENVIAR
        });
        parametros.botoes[i].setOnClickFunction(fnc);
    }
    
    lst  = document.getElementsByTagName("link");
    for(i = 0; i < lst.length; i++) {
        if (lst[i].attributes.rel && 
            (lst[i].attributes.rel.value.indexOf("icon") != -1 ||
             lst[i].attributes.rel.value.indexOf("shortcut") != -1)
           ) {
            favicon = lst[i].attributes.href;
            break;
        }
    }
    if (!favicon) favicon = "/favicon.ico";
    
    conteudo = '<table style="min-width:200px;" border="0" cellpadding="4" cellspacing="0" id="tblBotoesMensagem' + id + '">' +
               '<tr><td style="width:32px; height:64px; vertical-align: top;">$Icone$</td>' +
               '<td style="vertical-align: top;text-align:justify; padding-bottom: 10px; font-family:arial,verdana,sans-serife; font-size:10pt">' + (parametros.mensagem || parametros.pergunta) + '</td></tr>' +
               '<tr><td style="white-space: nowrap; text-align:right; background-color:#E6E6E6; padding:10px" colspan="2"></td></tr></table>';
    
    jnl = new JSDialogEdit.Janela({
        "ID"         : "jnlMensagem" + id,
        "Tipo" : JSDialogEdit.Janela.TiposJanela.MODAL,
        "AcaoFechar" : JSDialogEdit.Janela.AoFechar.DESTROY,
        "Titulo"     : parametros.titulo,
        "Largura"    : 400,
        "Altura"     : 400,
        "Icone"      : favicon
    });
    jnl.setConteudo(conteudo);
    if (parametros.retorno) jnl.setOnCloseFunction(function () {
        if(txtResposta) {
            parametros.retorno(null,null);
        } else {
            parametros.retorno(null);
        }
    });
    
    tbl = document.getElementById("tblBotoesMensagem" + id);
    for(i = 0; i < parametros.botoes.length; i++) {
        tbl.firstChild.rows[1].cells[0].appendChild(parametros.botoes[i].getElemento());
    }
    parametros.botoes[0].focus();
    
    if(parametros.pergunta) {
        tbl.firstChild.rows[0].cells[0].rowSpan = 2;
        
        txtResposta = new JSDialogEdit.CaixaTexto({
            'ID' : 'txtResposta' + id,
            'Valor' : parametros.resposta || ''
        });
       
        colunaResposta = tbl.insertRow(1).insertCell(-1);
        colunaResposta.appendChild(txtResposta.getElemento());
        
        if(!parametros.icone) {
            parametros.icone = JSDialogEdit.Janela.Mensagem.Icone.QUESTAO;
        }
    }
    
    if (parametros.icone) {
        tbl.firstChild.rows[0].cells[0].innerHTML = '<img src="' + parametros.icone + '">';
    } else {
        tbl.firstChild.rows[0].cells[0].style.display = "none";
    }
    
    largura = tbl.clientWidth;
    if (largura < document.body.clientWidth / 3) {
        jnl.setLargura(largura);
    } else {
        jnl.setLargura(parseInt(document.body.clientWidth / 3, 10));
        tbl.style.width = "100%";
    }
    jnl.setAltura(tbl.clientHeight + 22);
    
    if(txtResposta) {
        txtResposta.addEstilo('width', (colunaResposta.clientWidth - 14) + 'px');
        txtResposta.focus();
    }
    
    return jnl;
};

/** @struct {static final} TiposExibicao
 * Lista est&aacute;tica com as formas que uma JSDialogEdit.Janela pode exibir as barras de rolagem, valores poss&iacute;veis:
 * <ul>
 * <li><b>AUTO</b>: O navegador define quando e como ser&aacute; exibida as barras de rolagem.</li>
 * <li><b>HIDDEN</b>: As barras de rolagem nunca ser&atilde;o exibidas, o conteudo que esceder o limite da Janela ficar&aacute; oculto.</li>
 * <li><b>SCROLL</b>: As barras de rolagem sempre estar&atilde;o vis&iacute;veis.</li>
 * <li><b>VISIBLE</b>: N&atilde;o implementado.</li>
 * </ul>
 */
JSDialogEdit.Janela.TiposExibicao = {AUTO:"auto", HIDDEN:"hidden", SCROLL:"scroll", VISIBLE:"visible", HORIZONTAL:"horizontal", VERTICAL:"vertical"};

/** @struct {static final} TiposControle
 * Lista est&aacute;tica dos bot&otilde;es que pode ser exibidos na Barra de Titulo da Janela.
 * Para exibir mais de um bot&atilde;o, some os valores de cada um: JSDialogEdit.Janela.TiposControle.MINIMIZAR + JSDialogEdit.Janela.TiposControle.FECHAR.
 * Se for definido o valor JSDialogEdit.Janela.TiposControle.NENHUM, nada ser&aacute; exibido, mesmo se somar com outro valor.
 * Funcionalidade ainda em desenvolvimento.
 * Os valores de cada bot&atilde;o s&atilde;o:
 * <ul>
 * <li><b>MINIMIZAR</b>: Permite ao usuario minimizar a Janela para a parte inferior da tela.</li>
 * <li><b>MAXIMIZAR</b>: Permite ao usuario maximizar a Janela ocupando toda a area da tela.</li>
 * <li><b>FECHAR</b>: Permite ao usuario fechar a Janela, esta a&ccedil;&atilde;o dispara o evendo OnClose da Janela e executa o que estiver definido na propriedade AcaoFechar.</li>
 * <li><b>NENHUM</b>: N&atilde;o exibe nenhum bot&atilde;o na Barra de Titulo.</li>
 * </ul>
 */
JSDialogEdit.Janela.TiposControle = {MINIMIZAR:1, MAXIMIZAR:2, FECHAR:4, NENHUM:8}; // value.toString(2)

/** @struct {static final} AoFechar
 * Lista est&aacute;tica das possiveis a&ccedil;&otilde;es a serem executadas quando uma Janela for fechada.
 * Os valores poss&iacute;veis s&atilde;o:
 * <ul>
 * <li><b>DESTROY</b>: Remove a Janela da p&aacute;gina e apaga todas as referencias em JavaScript, liberando para o Garbage Collector do navegador.<sup>1</sup></li>
 * <li><b>NOTHING</b>: N&atilde;o executa nenhuma a&ccedil;&atilde;o.</li>
 * <li><b>HIDDEN</b>: Oculta a Janela da p&atilde;gina, porem todas as suas referencias, inclusive no DOM, s&atilde;o mantidas.</li>
 * </ul>
 * <sup>1</sup> Ainda com problemas nos metodos destrutores de classe.
 */
JSDialogEdit.Janela.AoFechar = {DESTROY:1, NOTHING:2, HIDDEN:3};

/** @struct {static final} TiposJanela
 * Lista est&aacute;tica com os tipos de Janelas que podem ser exibidas
 * Os valores poss&iacute;veis s&atilde;o:
 * <ul>
 * <li><b>NORMAL</b>: Uma Janela padr&atilde;o, permite ao usuario redimensiona-la alem de minimizar e maximizar.</li>
 * <li><b>DIALOG</b>: Uma janela de tamanho fixo, somente pode ser fechada.</li>
 * <li><b>MODAL</b>: Uma janela como a DIALOG, porem impede o usuario de interagir com a p&aacute;gina, ou mesmo com outras janelas.</li>
 * </ul>
 */
JSDialogEdit.Janela.TiposJanela = {NORMAL:1, DIALOG:2, MODAL:3};

/** @struct {static final} Mensagem.Icone
 * Lista est&aacute;tica com icones padr&otilde;oes utilizados pela Janela de Mensagens.
 * As op&ccedil;&otilde;es disponiveis s&atilde;o:
 * <ul>
 * <li><b>ALERTA</b>: Exibe um icone de Alerta</li>
 * <li><b>EXCLAMACAO</b>: Exibe um icone de Informa&ccedil;&atilde;o.</li>
 * <li><b>QUESTAO</b>: Exibe um icone de Quest&atilde;o.</li>
 * <li><b>ERRO</b>: Exibe um icone de Erro.</li>
 * <li><b>OK</b>: Exibe um icone de Aviso.</li>
 * </ul>
 */
JSDialogEdit.Janela.Mensagem.Icone = {
    ALERTA : JSDialogEdit.pastaImagens + "icon_dialog_alerta.png",
    EXCLAMACAO : JSDialogEdit.pastaImagens + "icon_dialog_exclamacao.png",
    QUESTAO : JSDialogEdit.pastaImagens + "icon_dialog_questao.png",
    ERRO : JSDialogEdit.pastaImagens + "icon_dialog_erro.png",
    OK : JSDialogEdit.pastaImagens + "icon_dialog_ok.png"
};

/**
 * @class {class} JSDialogEdit.Conexao
 * Classe utilizada na conexao com dados externos, aceita estruturas XML e JSON
 * @constructor JSDialogEdit.Conexao Cria um novo componente
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente.
 * @extends JSDialogEdit.Objeto
 */
JSDialogEdit.Conexao = function () {
    JSDialogEdit.Objeto.call(this);

    var self = this,
        propriedades = arguments[0],
        url = "",
        metodo = "post",
        tipoDados = "xml",
        formatoDados = "jsde",
        campos = [],
        dados  = [],
        registro = 0,
        conteiner = null,
        elemento = null,
        design = null,
        parametros = {},
        fonte = null,
        beforeConnect = function (e){},
        beforeConnectSrc = "",
        afterConnect = function (e){},
        afterConnectSrc = "",
        onDataBound = function (e){},
        onDataBoundSrc = "",
        setId = this.setId;

    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Conexao";
    this.eventoPadrao = "AfterConnect";
    
    /**
     * @function {void} dados
     * Usado internamente pelo JSDialogEdit.Editor para carregar informa&ccedil;&otilde;es sobre a fonte de dados.
     */
    this.dados = function () {
        try {
            this.carregarDados();
            this.exibirDados();
        } catch (ex) {
            debugger;
            console.log(ex);
            JSDialogEdit.Janela.Mensagem({
                "mensagem" : ex,
                "icone" : JSDialogEdit.Janela.Mensagem.Icone.ERRO
            });
        }
        
    };
    /**
     * @function {JSONObject} getParametros
     * Retorna quais s&atilde;o os parametros que ser&atilde;o enviados para a requisi&ccedil;&atilde;o da fonte de dados.
     * @return Objeto JSON dos parametros para a fonte de dados.
     */
    this.getParametros = function () {return parametros;};
    /**
     * @function {void} setParametros
     * Define quais s&atilde;o os parametros que ser&atilde;o enviados para a requisi&ccedil;&atilde;o da fonte de dados.
     * @param {JSONObject} v Objeto JSON com os parametros a serem envidas para a fonte de dados.
     */
    this.setParametros = function (v) {parametros = v;};
    /**
     * @function {void} addParametro
     * Adiciona um novo parametro para ser enviado na requisi&ccedil;&atilde;o a fonte de dados.
     * @param {String} n Nome do parametro.
     * @param {String} v Valor para o parametro.
     */
    this.addParametro = function (n, v) {
        if (n === null || v === null) throw "JSDialogEdit.Conexao: InvalidParametroException";
        parametros[n] = v;
    };
    /**
     * @function {void} setValorParametro
     * Define o valor para um dos parametros enviados na requisi&ccedil;&atilde;o do XML/JSON
     * @param {String} n Nome do parametro
     * @param {String} v Valor para o parametro
     */
    this.setValorParametro = function (n, v) {
        if (n === null || v === null) throw "JSDialogEdit.Conexao: InvalidParametroException";
        for(var item in parametros) {
            if (item == n) {
                parametros[item] = v;
                return this;
            }
        }
        throw "JSDialogEdit.Conexao: ParametroNotFoundException";
    };
    /**
     * @function {JSDialogEdit.Conteiner} getConteiner
     * Retorna o objeto {@link JSDialogEdit.Conteiner} em que o Componente est&aacute; localizado.
     * @return Conteiner que o Componente foi inserido
     */
    this.getConteiner  = function () {return conteiner;};
    /**
     * @function {void} setConteiner
     * Define o objeto {@link JSDialogEdit.Conteiner} no qual o Componente ser&aacute; inserido.
     * @param {JSDialogEdit.Conteiner} c Conteiner onde o Componente ser&aacute; inserido.
     */
    this.setConteiner  = function (v)  {conteiner = v;};
    /**
     * @function {String} getUrl
     * Retorna o endere&ccedil;o para a requisi&ccedil;&atilde;o da fonte de dados.
     * @return Endere&ccedil;o da fonte de dados.
     */
    this.getUrl = function () {return url;};
    /**
     * @function {void} setUrl
     * Define o endere&ccedil;o para a requisi&ccedil;&atilde;o da fonte de dados.
     * @param {String} v Endere&ccedil;o da fonte de dados.
     */
    this.setUrl = function (v) {url = v;};
    /**
     * @function {JSDialogEdit.Conexao.TiposDados} getTipoDados
     * Retorna o tipo dos dados que a fonte de dados dever&aacute; retornar.
     * @return Tipo da fonte de dados.
     */
    this.getTipoDados = function () {return tipoDados;};
    /**
     * @function {void} setTipoDados
     * Define qual o tipo de dados que a fonte de dados dever&aacute; retornar.
     * Veja {@link JSDialogEdit.Conexao.TiposDados} para saber os tipos poss&iacute;veis.
     * @param {JSDialogEdit.Conexao.TiposDados} Tipo da fonte de dados.
     */
    this.setTipoDados = function (v) {tipoDados = v;};
    /**
     * @function {JSDialogEdit.Conexao.FormatosDados} getFormatoDados
     * Retorna formato dos dados que a fonte de dados dever&aacute; retornar.
     * @return Formato da fonte de dados.
     */
    this.getFormatoDados = function () {return formatoDados;};
    /**
     * @function {void} setFormatoDados
     * Define qual o formato dos dados que a fonte de dados dever&aacute; retornar.
     * Veja {@link JSDialogEdit.Conexao.FormatosDados} para saber os formatos poss&iacute;veis.
     * @param {JSDialogEdit.Conexao.FormatosDados} Formato da fonte de dados.
     */
    this.setFormatoDados = function (v) {formatoDados = v;};
    /**
     * @function {DOM.HTMLElement} getElemento
     * Retorna uma referencia ao objeto DOM.HTMLElement que renderiza o JSDialogEdit.Conexao na p&aacute;gina.
     * @return Objeto HTML da p&aacute;gina
     */
    this.getElemento = function () {return elemento;};
    /**
     * @function {DOM.HTMLElement}getElementoDesign
     * Retorna uma referencia ao objeto DOM.HTMLElement que renderiza o componente durante a edi&ccedil;&atilde;o da janela.
     * @return Objeto HTML em tempo de design
     */
    this.getElementoDesign = function () {return design;};
    /**
     * @function {JSDialogEdit.Conexao.TiposMetodo} getMetodo
     * Retorna o metodo como os dados ser&atilde;o recuperados da fonte de dados.
     * @return Metodo de recupera&ccedil;&atilde;o.
     */
    this.getMetodo = function () {return metodo;};
    /**
     * @function {void} setMetodo
     * Define o metodo como os dados ser&atilde;o recuperados da fonte de dados.
     * Veja {@link JSDialogEdit.Conexao.TiposMetodo} para saber os metodos suportados.
     * @param Metodo de recupera&ccedil;&atilde;o.
     */
    this.setMetodo = function (v) {
        metodo = v;
        switch(v) {
            case JSDialogEdit.Conexao.TiposMetodo.JAVASCRIPT:
                this.getPropriedade("URL").habilitado = false;
                this.getPropriedade("Parametros").habilitado = false;
                this.getPropriedade("TipoDados").habilitado = false;
                this.getPropriedade("Dados").habilitado = false;
                url = "";
                parametros = {};
                tipoDados  = JSDialogEdit.Conexao.TiposDados.JSON;
                break;
            case JSDialogEdit.Conexao.TiposMetodo.POST:
            case JSDialogEdit.Conexao.TiposMetodo.GET:
            default:
                this.getPropriedade("URL").habilitado = true;
                this.getPropriedade("Parametros").habilitado = true;
                this.getPropriedade("TipoDados").habilitado = true;
                this.getPropriedade("Dados").habilitado = true;
                break;
        }
    };
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function (v) {
        if (v === "") return;
        setId.call(this, v);
        elemento.id = v;
        elemento.name = v;
        design.id = v;
    };
    /**
     * @function {void} setFonteDados
     * Define uma fonte de dados em Javascript para fornecer as informa&ccedil;&otilde;es dos registros a serem utilizados.
     * Deve estar no formato padronizado:
     * [
     *    {"nome_campo": "tipo"},
     *    [
     *       {"nome_campo": "valor"}
     *    ]
     * ]
     * @param {Array} fonte Array de objetos JSON (Chave:Valor) com os dados dos registros
     */
    this.setFonteDados = function ___jsdialogedit_conexao_setfontedados(fonte) {carregaJSON(fonte);};
    /**
     * @function {String} getBeforeConnect
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada antes da requisi&ccedil;&atildeo; a fonte de dados.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getBeforeConnect = function () {return beforeConnectSrc;};
    /**
     * @function {void} setBeforeConnect
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada antes da requisi&ccedil;&atildeo; a fonte de dados.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f C&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.setBeforeConnect = function (f) {beforeConnectSrc = f;};
    /**
     * @function {void} setBeforeConnectFunction
     * Define a fun&ccedil;&atilde;o a ser executada antes da requisi&ccedil;&atildeo; a fonte de dados.
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>void setBeforeConnectFunction()</i>
     */
    this.setBeforeConnectFunction = function (f) {beforeConnect = f;};
    /**
     * @function {String} getAfterConnect
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada apos a requisi&ccedil;&atildeo; a fonte de dados.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getAfterConnect = function () {return afterConnectSrc;};
    /**
     * @function {void} setAfterConnect
     * Define o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada apos a requisi&ccedil;&atildeo; a fonte de dados.<br>
     * Metodo exclusivo para apoio ao Editor.
     * @param {String} f C&oacute;digo fonte da fun&ccedil;&atilde;o
     */
    this.setAfterConnect = function (f) {afterConnectSrc = f;};
    /**
     * @function {void} setAfterConnectFunction
     * Define a fun&ccedil;&atilde;o a ser executada apos a requisi&ccedil;&atildeo; a fonte de dados.
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>void setAfterConnectFunction()</i>
     */
    this.setAfterConnectFunction = function (f) {afterConnect = f;};
    /**
     * @function {String} getOnDataBound
     * Retorna o c&oacute;digo fonte da fun&ccedil;&atilde;o que ser&aacute; executada sempre que
     * for necessario vincular um Componente ao objeto de Conexao.
     * Metodo exclusivo para apoio ao Editor.
     * @return C&oacute;digo fonte da fun&ccedil;&atilde;o.
     */
    this.getOnDataBound = function () {return onDataBoundSrc;};
    /**
     * @function {void} setOnDataBound
     * Define a fun&ccedil;&atilde;o a ser executada sempre que
     * for necessario vincular um Componente ao objeto de Conexao.
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>void setOnDataBound()</i>
     */
    this.setOnDataBound = function (f) {onDataBoundSrc = f;};
    /**
     * @function {void} setOnDataBoundFunction
     * Define a fun&ccedil;&atilde;o a ser executada sempre que for necessario vincular
     * um Componente ao objeto de Conexao.
     * @param {delegate Function} f Fun&ccedil;&atilde;o a ser executada.<br>
     * Assinatura: <i>void setOnDataBoundFunction()</i>
     */
    this.setOnDataBoundFunction = function (f) {onDataBound = f;};
    /**
     * @function {void} parseElemento
     * Utilizado internamente para processar os c&oacute;digos fonte gerados pelo Editor.
     * Realiza o processamento deste Componente em um elemento DOM.HTMLElement, podendo assim ser inserido em uma p&aacute;gina.
     */
    this.parseElemento = function ___jsdialogedit_conexao_parseelemento() {
        var fBeforeConnect = new Function(self.getBeforeConnect()),
            fAfterConnect  = new Function(self.getAfterConnect()),
            fOnDataBound    = new Function(self.getOnDataBound());
        
        beforeConnect = fBeforeConnect;
        afterConnect  = fAfterConnect;
        onDataBound   = fOnDataBound;
        
        this.carregarDados();
    };
    this.exibirDados = function ___jsdialogedit_conexao_exibirDados() {
        if (dados.length === 0) return;

        var tbl, tbd, tr, td, x, y;
        tbl = document.createElement("table");
        tbl.width = "100%";
        tbl.border = 1;
        tbl.cellPadding = 2;
        tbl.cellSpacing = 0;
        tbd = document.createElement("tbody");
        tbl.appendChild(tbd);

        //campos
        tr = document.createElement("tr");
        for(x = 0; x < campos.length; x++) {
            td = document.createElement("th");
            td.style.textAlign = "center";
            td.style.backgroundColor = "#CCCCCC";
            td.innerHTML = campos[x].getId();
            tr.appendChild(td);
        }
        tbd.appendChild(tr);

        //dados
        for(x = 0; x < dados.length; x++) {
            tr = document.createElement("tr");
            for(y = 0; y < campos.length; y++) {
                td = document.createElement("td");
                var tt = campos[y].getTipo();
                if (tt == "number" || tt == "int" || tt == "float" || tt == "double" || tt == "decimal") td.style.textAlign = "right";
                td.innerHTML = dados[x][campos[y].getId()];
                tr.appendChild(td);
            }
            tbd.appendChild(tr);
        }

        var jan = new JSDialogEdit.Janela({
            "ID"         : "jan" + this.getId(),
            "Largura"    : 640,
            "Altura"     : 480,
            "Tipo"       : JSDialogEdit.Janela.TiposJanela.MODAL,
            "Titulo"     : 'Dados de "' + url + '"',
            "AcaoFechar" : JSDialogEdit.Janela.AoFechar.DESTROY
        });
        var cnx = new JSDialogEdit.Conexao({
            "ID"        : "cnx" + this.getId(),
            "Metodo"    : JSDialogEdit.Conexao.TiposMetodo.JAVASCRIPT
        });
        var grd = new JSDialogEdit.Tabela({
            "ID"           : "grd" + this.getId(),
            "Superior"     : 0,
            "Esquerda"     : 0,
            "Largura"      : 640,
            "Altura"       : 460,
            "Conector"     : "cnx" + this.getId(),
            "Visivel"      : true,
            "Cabecalho"    : true,
            "Rodape"       : false,
            "AutoVincular" : true
        });
        jan.setVisivel(true);
        jan.addFilho(cnx);
        jan.addFilho(grd);
        cnx.setFonteDados(fonte);
        cnx.vincularDados();
    };
    this.carregarDados = function ___jsdialogedit_conexao_carregarDados(assincrono) {
        if (url === "") return;
        if (assincrono === undefined) assincrono = false;
        
        campos = [];
        dados = [];
        
        beforeConnect.call(self);
        
        var j = new JSDialogEdit.Ajax();
        j.url = url;
        j.dados = parametros;
        j.tipoRequisicao = metodo;
        j.assincrono = assincrono;
        j.erro = function (e){alert("Erro:" + e);};
        
        if (tipoDados == JSDialogEdit.Conexao.TiposDados.XML) {
            j.metodo = carregaXML;
            j.requestXML();
        } else if (tipoDados == JSDialogEdit.Conexao.TiposDados.JSON) {
            j.metodo = carregaJSON;
            j.request();
        } else {
            alert("Erro interno:" + tipoDados + " e um valor invalido");
            return;
        }
    };
    this.vincularDados = function ___jsdialogedit_conexao_vinculardados() {
        this.getConteiner().vincularDados(this.getId());
        onDataBound.call(self);
    };
    /**
     * @function {void} atualizaDados
     * Dispara um evento para que todos os componentes vinculados tenham seus dados atualizados.
     */
    this.atualizaDados = function ___jsdialogedit_conexao_atualizaDados() {
        this.getConteiner().atualizaDados(this.getId());
    };
    this.getFilhos = function ___jsdialogedit_conexao_getFilhos() {return campos;};
    this.getDados = function ___jsdialogedit_conexao_getDados() {return dados;};
    this.getCampos = function ___jsdialogedit_conexao_getCampos() {return campos;};
    this.getCampo = function ___jsdialogedit_conexao_getCampo(id) {
        for(var x = 0; x < campos.length; x++) {
            if (campos[x].getId() == id) return campos[x];
        }
        return null;
    };
    this.addCampo = function ___jsdialogedit_conexao_addCampo(campo) {
        if(campo instanceof JSDialogEdit.Conexao.Campo) {
            campos.push(campo);
        } else {
            throw "JSDialogEdit.Conexao: InvalidArgumentException";
        }
    };
    /**
     * @function {void} novoRegistro
     * Permite adicionar um novo registro ao componente de Conex&atilde;o.
     * Dispara um evento para que todos os componentes vinculados tenham seus dados atualizados.
     * @param {JSONObject} registro Objeto com os dados a serem adicionados
     */
    this.novoRegistro = function ___jsdialogedit_conexao_novoRegistro(registro) {
        var i, campo, reg = {};
        
        for(i = 0; i < campos.length; i++) {
            campo = campos[i].getId();
            reg[campo] = registro[campo];
        }
        
        dados.push(reg);
        this.atualizaDados();
    };
    /**
     * @function {void} alterarRegistro
     * Permite alterar um registro do componente de Conex&atilde;o.
     * Dispara um evento para que todos os componentes vinculados tenham seus dados atualizados.
     * @param {int} indice Posicao do registro a ser alterado
     * @param {JSONObject} registro Objeto com os novos dados a serem alterados
     */
    this.alterarRegistro = function ___jsdialogedit_conexao_alterarRegistro(indice, registro) {
        var i, campo;
        
        for(i = 0; i < campos.length; i++) {
            campo = campos[i].getId();
            dados[indice][campo] = registro[campo];
        }
        
        this.atualizaDados();
    };
    /**
     * @function {void} removeRegistro
     * Permite remover um registro do componente de Conex&atilde;o.
     * Dispara um evento para que todos os componentes vinculados tenham seus dados atualizados.
     * @param {int} indice Posicao do registro a ser removido
     */
    this.removeRegistro = function ___jsdialogedit_conexao_removeRegistro(indice) {
        dados.splice(indice, 1);
        
        // TODO realizar o filtro!
        
        this.atualizaDados();
    };
    /**
     * @function {void} removeRegistros
     * Permite remover diversos registros do componente de Conex&atilde;o.
     * Dispara um evento para que todos os componentes vinculados tenham seus dados atualizados.
     * @param {Array<int>} lista Array com as posi&ccedil;&otilde;es dor registros a serem removidos
     */
    this.removeRegistros = function ___jsdialogedit_conexao_removeRegistro(lista) {
        for(var x = 0; x < lista.length; x++) dados.splice(lista[x] - x, 1);
        this.atualizaDados();
    };
    /**
     * @function {Array<JSONObject>} filtrar
     * Retorna um  array de registros que atendam ao criterio especificado pela funcao fornecida
     * @param {function} filtro Funcao a ser usada como filtro
     * A funcao recebera cada um dos registros para ser validado e deve retornar um valor boleano
     * indicando se o registro vai ou nao ser retornado.
     * @return Array com os registros que atendem ao filtro
     */
    this.filtrar = function (filtro) {
        var retorno = [];
        
        for(var x = 0; x < dados.length; x++) {
            if(filtro(dados[x])) retorno.push(dados);
        }
        
        return retorno;
    };
    this.proximo = function ___jsdialogedit_conexao_proximo() {
        if (registro < dados.length - 1) registro++;
        this.vincularDados();
    };
    this.anterior = function ___jsdialogedit_conexao_anterior() {
        if (registro > 0) registro--;
        this.vincularDados();
    };
    this.primeiro = function ___jsdialogedit_conexao_primeiro() {
        registro = 0;
        this.vincularDados();
    };
    this.ultimo = function ___jsdialogedit_conexao_ultimo() {
        registro = dados.length - 1;
        this.vincularDados();
    };
    this.tamanho = function ___jsdialogedit_conexao_tamanho() {return dados.length;};
    /**
     * @function {object} getValorCampo
     * Retorna o valor do Campo armazenado no XML/JSON recuperado pelo objeto
     * @param  {String} nomeCampo Nome do campo a ser pesquisado
     * @param  {int} indice 
     * @return  Conteudo do campo
     */
    this.getValorCampo = function ___jsdialogedit_conexao_(nomeCampo, indice) {
        var x, tipo;
        if (dados.length === 0) return "";
        if (indice === undefined || isNaN(indice)) indice = registro;
        for(x = 0; x < campos.length; x++) {
            if (campos[x].getId() == nomeCampo) {
                tipo = campos[x].getTipo();
            }
        }
        
        switch(tipo) {
            case "string":
                return dados[indice][nomeCampo];
            case "number":
                return parseFloat(dados[indice][nomeCampo].replace(",", "."));
            case "boolean":
                return dados[indice][nomeCampo] == "true" ? true : dados[indice][nomeCampo] == "1" ? true : false;
            case "int":
                return parseInt(dados[indice][nomeCampo], 10);
            default:
                return dados[indice][nomeCampo];
        }
    };
    /**
     * @function {Array} getValoresCampo
     * Retorna todos os valores do Campo armazenado no XML/JSON recuperado pelo objeto
     * @param {String} nomeCampo Nome do campo a ser pesquisado
     * @return {Array} conteudo do campo
     */
    this.getValoresCampo = function ___jsdialogedit_conexao_(nomeCampo) {
        var retorno = [];
        if (dados.length === 0) return retorno;
        for(var x = 0; x < dados.length; x++) {
            retorno.push(dados[x][nomeCampo]);
        }
        return retorno;
    };
    
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) delete this[item];
        self = null;
    };
    
    var carregaXML = function (docXml) {
        var colunas, campo, conteudo, linha;
        fonte = [{},[]];
        
        // carregando campos
        colunas = docXml.documentElement.childNodes[0];
        if (colunas) {
            campo = colunas.childNodes[0];
            if (!campo) {
                alert("Estrutura XML invalida! Consulte a documentacao");
                return;
            }

            while(campo) {
                var objc = new JSDialogEdit.Conexao.Campo();
                objc.setId(campo.nodeName);
                objc.setTipo(campo.getAttribute("tipo") || "string");
                campos.push(objc);
                fonte[0][campo.nodeName] = campo.getAttribute("tipo") || "string";
                campo = campo.nextSibling;
            }
        }
        // ---

        // carregando dados
        conteudo = docXml.documentElement.childNodes[1];
        if (conteudo) {
            linha = conteudo.childNodes[0];
            if (linha) {
                while(linha) {
                    var obj = {};
                    campo = linha.childNodes[0];
                    while(campo) {
                        obj[campo.nodeName] = campo.childNodes[0] ? campo.childNodes[0].nodeValue : "";
                        campo = campo.nextSibling;
                    }
                    dados.push(obj);
                    linha = linha.nextSibling;
                }
                
                fonte[1] = dados;
            }
        }
        // ----
        
        afterConnect.call(self);
        registro = 0;
    };
    var carregaJSON = function (json) {
        var colunas, campo, conteudo, linha, x;
        if (typeof json === "string") json = JSON.parse(json);
        if (formatoDados === JSDialogEdit.Conexao.FormatosDados.ARRAY) json = converteFormato(json);
        if (!(json instanceof Array)) {
            alert("Estrutura JSON invalida! Consulte a documentacao:" + JSON.stringify(json));
            return;
        }
        
        // carregando campos
        colunas = json[0];
        if (typeof colunas !== "object") {
            alert("Estrutura JSON invalida! Consulte a documentacao");
            return;
        }
        
        campos = [];
        for(campo in colunas) {
            var objc = new JSDialogEdit.Conexao.Campo();
            objc.setId(campo);
            objc.setTipo(colunas[campo]);
            campos.push(objc);
        }
        // ---
        
        // carregando dados
        if (json.length > 1) {
            conteudo = json[1];
            if (!(conteudo instanceof Array)) {
                alert("Estrutura JSON invalida! Consulte a documentacao");
                return;
            }
            
            dados = [];
            for(x = 0; x < conteudo.length; x++) {
                linha = conteudo[x];
                var obj = {};
                for(campo in linha) obj[campo] = linha[campo];
                dados.push(obj);
            }
        }
        // ---
        
        afterConnect.call(self);
        registro = 0;
        fonte = json;
    };
    var converteFormato = function (json) {
        var cabecalho = {};
        var obj = json[0];
        
        for(var item in obj) {
            if (item === "true" || item === "false") {
                cabecalho[item] = "boolean";
            } else if (!isNaN(item)) {
                cabecalho[item] = "number";
            } else {
                cabecalho[item] = "string";
            }
        }
        
        return [cabecalho, json];
    };
    var init = function () {
        elemento = document.createElement("input");
        elemento.type = "hidden";
        design = document.createElement("img");
        design.src = JSDialogEdit.pastaImagens + "Conexao.png";
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "URL",
            "descricao" : "URL onde devera ser buscado os dados",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getUrl",
            "set" : "setUrl",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Parametros",
            "descricao" : "Paramtros a serem enviados na requisicao",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Objeto,
            "get" : "getParametros",
            "set" : "setParametros",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Metodo",
            "descricao" : "Define o metodo como os dados serão recuperados no servidor",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getMetodo",
            "set" : "setMetodo",
            "opcoes" : JSDialogEdit.Conexao.TiposMetodo,
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "TipoDados",
            "descricao" : "Define o tipo de dados que serão retornados pelo servidor",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getTipoDados",
            "set" : "setTipoDados",
            "opcoes" : JSDialogEdit.Conexao.TiposDados,
            "habilitado" : true
        }));        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "FormatoDados",
            "descricao" : "Define o formato dos dados a serem lidos",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getFormatoDados",
            "set" : "setFormatoDados",
            "opcoes" : JSDialogEdit.Conexao.FormatosDados,
            "habilitado" : true
        }));        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Dados",
            "descricao" : "Permite carregar os dados do servidor",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Acao,
            "funcao" : "dados",
            "habilitado" : true,
            "refresh" : true
        }));        
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "BeforeConnect",
            "descricao" : "Evento ocorrido antes que seja feita a requisicao",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getBeforeConnect",
            "set" : "setBeforeConnect",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : ""
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "AfterConnect",
            "descricao" : "Evento ocorrido apos realizar a requisicao",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getAfterConnect",
            "set" : "setAfterConnect",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : ""
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnDataBound",
            "descricao" : "Evento ocorrido sempre que for necessario vincular um Componente ao objeto de Conexao",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnDataBound",
            "set" : "setOnDataBound",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : ""
        }));
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Conexao, JSDialogEdit.Objeto);

/**
 * @struct {static final JSONObject} JSDialogEdit.Conexao.TiposMetodo Lista est&aacute;tica com os tipos de requisi&ccedil;&atilde;o que o componente Conexao pode realizar:
 * <ul>
 * <li><b>POST</b> Realiza uma requisi&ccedil;&atilde;o utilizando o m&eacute;todo HTTP POST.
 * <li><b>GET</b> Realiza uma requisi&ccedil;&atilde;o utilizando o m&eacute;todo HTTP GET.
 * <li><b>JAVASCRIPT</b> Ao inves de realizar uma requisi&ccedil;&atilde;o HTTP, utiliza uma variavel JavaScript.
 * </ul>
 */
JSDialogEdit.Conexao.TiposMetodo = {"POST":"post", "GET":"get", "JAVASCRIPT":"javascript"};
/** @struct {static final} JSDialogEdit.Conexao.TiposDados Lista est&aacute;tica com os tipos de dados que o componetne Conexao pode receber */
JSDialogEdit.Conexao.TiposDados = {"XML":"xml", "JSON":"json"};
/** @struct {static final} JSDialogEdit.Conexao.FormatosDados Lista est&aacute;tica com os formatos de dados que o componetne Conexao pode receber */
JSDialogEdit.Conexao.FormatosDados = {"JSDE":"jsde", "ARRAY":"array"};

/**
 * @class {class} JSDialogEdit.Conexao.Campo
 * @constructor JSDialogEdit.Conexao.Campo Cria um novo componente
 * @param {String} i ID do campo
 * @param {String} t Tipo do campo, os valores possiveis sao:
 * <ul>
 * <il><b>String</b> Campo com conteudo alfanumerico
 * <il><b>Number</b> Campo contendo numero inteiro ou decimal
 * <il><b>Boolean</b> Campo logico podendo ter o valor representado como "true"/"false" ou 1/0
 * </ul>
 * @extends JSDialogEdit.Objeto
 */
JSDialogEdit.Conexao.Campo = function (i, t) {
    JSDialogEdit.Objeto.call(this);
    
    var self = this,
        id = i,
        tipo = t || "";

    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Conexao.Campo";
    
    /**
     * @function {String} toString
     * Retorna uma representa&ccedil;&atilde;o textual para o Conexao.Campo, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return texto representando o objeto
     */
    this.toString = function () {return this.CLASSE + "[#" + this.getId() + "]";};
    
    /**
     * @function {String} getId
     * Retorna o valor do IDentificador do componente utilizado para identificar de forma unica o componente na pagima HTML.
     * @return Propriedade ID do componente e do elemento HTML na p&aacute;gina
     */
    this.getId = function () {return id;};
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function (v) {if (v !== "") id = v;};
    this.getTipo = function () {return tipo;};
    this.setTipo = function (v) {tipo = v;};
    
    var init = function () {
        self.getPropriedade("ID").habilitado = false;
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Nome",
            "descricao" : "Nome do campo",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getId",
            "readonly" : true,
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Tipo",
            "descricao" : "Tipo de dados do campo",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getTipo",
            "readonly" : true,
            "habilitado" : true
        }));
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Conexao.Campo, JSDialogEdit.Objeto);

/**
 * @class {class} JSDialogEdit.GerenciadorJanela
 * Classe utilizada internamente para controlar as janelas criadas pela framework
 * @constructor JSDialogEdit.GerenciadorJanela Cria um novo componente
 * @extends JSDialogEdit.Conteiner
 */
JSDialogEdit.GerenciadorJanela = function () {
    JSDialogEdit.Conteiner.call(this, "div");
    
    var self = this,
        ZINDEX = 20,
        ZINDEXMODAL = 1000,
        janelaSelecionada = null,
        addFilho = this.addFilho,
        removeFilho = this.removeFilho,
        removeTodosFilhos = this.removeTodosFilhos,
        conteiner = document.body;

    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.GerenciadorJanela";
    
    this.getConteiner = function () {return conteiner;};
    this.setConteiner = function (v) {
        var f = this.getFilhos();
        conteiner = v;
        for(var x = 0; x < f.length; x++) conteiner.appendChild(f[x].getElemento());
    };
    
    this.setFocus = function (janela) {
        var x, indice, tipoModal;
        var lstJanelas = this.getFilhos();
        var ultimaJanela = lstJanelas.length - 1;
        
        if(lstJanelas.length === 0) return;
        
        if(!janela) {
            if(janelaSelecionada !== null) lstJanelas[janelaSelecionada].setAtiva(false, true);
            janelaSelecionada = null;
            return;
        }
        
        tipoModal = janela.getTipoJanela() == JSDialogEdit.Janela.TiposJanela.MODAL;
        indice = this.indexOf(janela);
        if(indice === -1) return;
        if(indice == janelaSelecionada) return;
        
        // tem de ter uma janela selecionada, e ela ainda tem de existir (nao acabou de ser fechada)
        if(janelaSelecionada !== null && janelaSelecionada <= ultimaJanela) lstJanelas[janelaSelecionada].setAtiva(false, true);
        lstJanelas.splice(indice, 1);
        lstJanelas.push(janela);
        
        if (!tipoModal || janela.getMode() === "edicao") {
            for(x = indice; x < ultimaJanela; x++) {
                lstJanelas[x].setZIndex(ZINDEX + x);
            }
            janela.setZIndex(ZINDEX + lstJanelas.length);
        } else if(tipoModal) {
            for(x = indice; x < ultimaJanela; x++) {
                if(lstJanelas[x].getTipoJanela() == JSDialogEdit.Janela.TiposJanela.MODAL) {
                    lstJanelas[x].setZIndex(ZINDEXMODAL + x);
                }
            }
            janela.setZIndex(ZINDEXMODAL + lstJanelas.length);
        }


        janela.setAtiva(true, true);
        janelaSelecionada = lstJanelas.length - 1;
    };
    /*this.setFocus_deprecated = function (janela) {
        var x;
        var achou = false;
        var lstJanelas = this.getFilhos();
        
        if(!janela) {
            for(x = 0; x < lstJanelas.length; x++) {
                lstJanelas[x].setAtiva(false);
            }
            return;
        }
        
        var tipoModal = janela.getTipoJanela() == JSDialogEdit.Janela.TiposJanela.MODAL;
        
        for(x = 0; x < lstJanelas.length - 1; x++) {
          if (lstJanelas[x] === janela) achou = true;
          if (achou) {
              lstJanelas[x] = lstJanelas[x + 1];
              if (!tipoModal || janela.getMode() === "edicao") lstJanelas[x].setZIndex(ZINDEX + x);
          }
          if (lstJanelas[x]) lstJanelas[x].setAtiva(false);
        }

        lstJanelas[lstJanelas.length-1] = janela;
        if (!tipoModal || janela.getMode() === "edicao") janela.setZIndex(ZINDEX + lstJanelas.length);
        janela.setAtiva(true);
    };*/
    this.addFilho = function ___jsdialogedit_gerenciadorjanela_addfilho(janela) {
        if (!(janela instanceof JSDialogEdit.Janela))
            throw "JSDialogEdit.GerenciadorJanela: Somente Janelas podem ser adicionadas";
        addFilho.call(this, janela);
        conteiner.appendChild(janela.getElemento());
        janela.setGerenciador(this);
        this.setFocus(janela);
    };
    this.removeFilho = function (c) {
        conteiner.removeChild(c.getElemento());
        removeFilho.call(this, c);
        var f = this.getFilhos();
        if (f.length > 0) this.setFocus(f[f.length-1]);
    };
    this.removeTodosFilhos = function () {
        throw "JSDialogEdit.GerenciadorJanela: Nao implementado";
    };
    this.ordenarJanelas = function (){
        var lstJanelas = this.getFilhos();
        
        for(var x = 0; x < lstJanelas.length; x++) {
          if (lstJanelas[x].getTipoJanela() != JSDialogEdit.Janela.TiposJanela.MODAL || lstJanelas[x].getMode() === "edicao")
            lstJanelas[x].setZIndex(ZINDEX + x);
        }
    };
    this.indexOf = function (c) {
        var filhos = this.getFilhos();
        for(var x = 0; x < filhos.length; x++) if (c === filhos[x]) return x;
        return -1;
    };
    
    var windowResize = function () {
        var lar, alt;
        var lstJanelas = this.getFilhos();
        for(var x = 0; x < lstJanelas.length; x++) {
            if (lstJanelas[x].getMode() === "edicao") continue;
            
            if (lstJanelas[x].getTipoJanela() == JSDialogEdit.Janela.TiposJanela.MODAL) {
                var px, py;
                px = parseInt((document.body.clientWidth - lstJanelas[x].getLargura())/2, 10);
                py = parseInt((document.body.clientHeight - lstJanelas[x].getAltura())/2, 10);
                lstJanelas[x].setEsquerda(px);
                lstJanelas[x].setSuperior(py);
                
            } else if (lstJanelas[x].isMaximized()) {
                lstJanelas[x].setAltura(document.body.clientHeight - 4);
                lstJanelas[x].setLargura(document.body.clientWidth - 4);
            }
        }
    };
    var init = function () {
        self.registraEvento("resize", windowResize, window);
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.GerenciadorJanela, JSDialogEdit.Conteiner);

/**
 * @class {class} JSDialogEdit.CaixaGrupo
 * Classe representando uma CaixaGrupo com todos os seus atributos
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente
 */
JSDialogEdit.CaixaGrupo = function () {
    JSDialogEdit.Conteiner.call(this, "fieldset"); //, arguments[0]);

    var self = this,
        propriedades = arguments[0] || null,
        titulo = document.createElement("legend"),
        altura = 0,
        largura = 0,
        addFilho = this.addFilho,
        removeFilho = this.removeFilho,
        removeTodosFilhos = this.removeTodosFilhos,
        setAltura = this.setAltura,
        setLargura = this.setLargura;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.CaixaGrupo";
    
    /**
     * @function {String} toString
     * Retorna uma representa&ccedil;&atilde;o textual para a CaixaGrupo, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return texto representando o objeto
     */
    this.toString = function () {return this.CLASSE + "[#" + this.getId() + "]";};
    
    this.showTitulo = function (v) {
        if (v) {
            titulo.style.display = "";
        } else {
            titulo.style.display = "none";
        }
    };

    this.addFilho = function (f) {
        addFilho.call(this, f);
        this.appendHTMLChild(f.getElemento());
    };
    
    /**
     * @function {void} removeFilho
     * Remove um Componente filho da Janela
     * @param {JSDialogEdit.Componente} c Componente a ser retirado
     */
    this.removeFilho = function (c) {
        removeFilho.call(this, c);
        this.removeHTMLChild(c.getElemento());
    };

    this.removeTodosFilhos = function () {
        removeTodosFilhos.call(this);
        var filhos = this.getElemento().children;
        for(var x = filhos.length - 1; x >= 0; x--) {
            this.removeHTMLChild(filhos[x]);
        }
    };

    this.setAltura = function (v) {
        setAltura.call(this, v);
        if (JSDialogEdit.Core.getBrowser().indexOf("gecko") == -1) return;
        
        var borda = this.getElemento().style.borderWidth;
        altura = v + parseInt(borda ? borda : 2, 10) * 2;
        this.getElemento().style.clip = "rect(0px, " + largura + "px, " + altura + "px, 0px)";
    };
    
    this.setLargura = function (v) {
        setLargura.call(this, v);
        if (JSDialogEdit.Core.getBrowser().indexOf("gecko") == -1) return;
        
        var borda = this.getElemento().style.borderWidth;
        largura = v + parseInt(borda ? borda : 2, 10) * 2;
        this.getElemento().style.clip = "rect(0px, " + largura + "px, " + altura + "px, 0px)";
    };
    
    this.getTitulo = function () {return titulo.textContent ? titulo.textContent : titulo.innerHTML;};
    this.setTitulo = function (v) {this.showTitulo(v !== "");titulo.innerHTML = v;};
    var destroy = this.destroy;
    /**
     * @function {void} destroy
     * M&eacute;todo destrutor da classe
     */
    this.destroy = function () {
        destroy.call(this);
        for(var item in self) delete this[item];
        self = null;
    };

    var init = function () {
        self.getPropriedade("Valor").habilitado = false;
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        self.getPropriedade("TabIndex").habilitado = false;
        self.getPropriedade("Desabilitado").habilitado = false;
        self.getPropriedade("Layout").habilitado = false;
        self.getEvento("OnFocus").habilitado = false;
        self.getEvento("OnBlur").habilitado = false;
        self.getEvento("OnClick").habilitado = false;
        
        self.getElemento().style.padding = "0px";
        self.getElemento().style.overflow = "hidden";
        self.appendHTMLChild(titulo);
        self.showTitulo(false);
    
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Titulo",
            "descricao" : "Titulo da Caixa de Grupo",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getTitulo",
            "set" : "setTitulo",
            "habilitado" : true
        }));
        
        altura = 100;
        largura = 100;
        if (!propriedades || !propriedades.Altura) self.setAltura(altura);
        if (!propriedades || !propriedades.Largura) self.setLargura(largura);
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };

    init();
};
JSDialogEdit.Core.register(JSDialogEdit.CaixaGrupo, JSDialogEdit.Conteiner);

/**
 * @class {class} JSDialogEdit.Temporizador
 * Classe representando um Temporizador com todos os seus atributos
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente
 */
JSDialogEdit.Temporizador = function () {
    JSDialogEdit.Objeto.call(this);
    
    var self = this,
        propriedades = arguments[0] || null,
        elemento = null,
        design = null,
        conteiner = null,
        
        tempo = null,
        tempoDecorridoSrc = "",
        tempoDecorrido = function (e) {},
        timer = null,
        setId = this.setId;

    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Temporizador";
    this.eventoPadrao = "TempoDecorrido";
    
    /**
     * @function {String} toString
     * Retorna uma representacao textual para o Temporizador, informando o nome da classe e o ID do objeto entre "[ ]"
     * @return texto representando o objeto
     */
    this.toString = function () {return this.CLASSE + "[#" + this.getId() + "]";};
    this.getElemento = function () {return elemento;};
    this.getElementoDesign = function () {return design;};
    this.getConteiner  = function ()  {return conteiner;};
    this.setConteiner  = function (v)  {conteiner = v;};
    
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function (v) {
        if (v === "") return;
        setId.call(this, v);
        elemento.id = v;
        elemento.name = v;
        design.id = v;
    };
    this.getTempo = function () {return tempo;};
    this.setTempo = function (v) {tempo = v;};

    this.getTempoDecorrido = function () {return tempoDecorridoSrc;};
    this.setTempoDecorrido = function (v) {tempoDecorridoSrc = v;};
    this.setTempoDecorridoFunction = function (f) {tempoDecorrido = f;};
    
    this.iniciar = function () {
        if (isNaN(tempo)) return;
        window["___jsdetimer_" + this.getId()] = function () {tempoDecorrido.call(self);};
        timer = setInterval("___jsdetimer_" + this.getId() + "()",tempo);
    };
    
    this.parar = function () {
        timer = window.clearInterval(timer);
        delete window["___jsdetimer_" + this.getId()];
    };

    /**
     * @function {void} parseElemento
     * Utilizado internamente para processar os c&oacute;digos fonte gerados pelo Editor.
     * Realiza o processamento deste Componente em um elemento DOM.HTMLElement, podendo assim ser inserido em uma p&aacute;gina.
     */
    this.parseElemento = function () {
        tempoDecorrido = new Function(self.getTempoDecorrido());
    };
    
    var init = function () {
        elemento = document.createElement("input");
        elemento.type = "hidden";
        design = document.createElement("img");
        design.src = JSDialogEdit.pastaImagens + "Temporizador.png";
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Tempo",
            "descricao" : "Intervalo em milisegundos a ser aguardado para disparar o evento",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Numero,
            "get" : "getTempo",
            "set" : "setTempo",
            "habilitado" : true
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "TempoDecorrido",
            "descricao" : "Evento chamado sempre que transcorrer o tempo definido",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getTempoDecorrido",
            "set" : "setTempoDecorrido",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : ""
        }));
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Temporizador, JSDialogEdit.Objeto);

/**
 * @class {class} JSDialogEdit.PainelAbas
 * Classe representando um Painel para Abas com todos os seus atributos
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente
 */
JSDialogEdit.PainelAbas = function () {
    JSDialogEdit.Componente.call(this, "div"); //, arguments[0]);
    
    var self = this,
        propriedades = arguments[0] || null,
        filhos = [],
        dragging = false,
        dragDiv = null,
        dragX = null,
        maxDragX = 0,
        divAbas = null,
        divAbasInterno = null,
        divRolarDireita = null,
        divRolarEsquerda = null,
        abaAtiva = null,
        itensInseridos = 0,
        iconePadrao = "",
        exibeFecharAba = false,
        moverAbas = false,
        layout = JSDialogEdit.Conteiner.TiposLayout.NONE,
        onchangeSrc = "",
        onchange = function (e, abaAtiva, aba) {},
        oncloseSrc = "",
        onclose = function (e, aba) {},
        onbeforemoveSrc = "",
        onbeforemove = function (e, aba) {},
        onaftermoveSrc = "",
        onaftermove = function (e, aba) {},
        setId = this.setId,
        setLargura = this.setLargura,
        setAltura = this.setAltura,
        parseElemento = this.parseElemento,
        toObject = this.toObject;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.PainelAbas";
    this.larguraMin = "120";
    this.alturaMin = "27";
    this.dragAba = null;
    this.eventoPadrao = "OnChange";
    
    /**
     * @function {void} parseElemento
     * Utilizado internamente para processar os c&oacute;digos fonte gerados pelo Editor.
     * Realiza o processamento deste Componente em um elemento DOM.HTMLElement, podendo assim ser inserido em uma p&aacute;gina.
     */
    this.parseElemento = function () {
        parseElemento.call(this);
        onchange = new Function("e", "abaAtiva", "aba", self.getOnChange());
        onclose = new Function("e", "aba", self.getOnClose());
        onbeforemove = new Function("e", "aba", self.getOnBeforeMove());
        onaftermove = new Function("e", "aba", self.getOnAfterMove());
    };
    /**
     * @function {JSONObject} toObject
     * Serializa o Objeto no formato JSON com os dados das Propriedades e Eventos da classe.
     * @return Objeto JSON com as informa&ccedil;&otilde;es.
     */
    this.toObject = function () {
        var obj = toObject.call(this);
        
        obj.filhos = [];
        for(var x = 0; x < filhos.length; x++) {
            obj.filhos.push(filhos[x].toObject());
        }
        
        return obj;
    };
    this.setId = function (v) {
        var old = this.getId();
        
        setId.call(this, v);
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getId() == old + "_Aba" + (x + 1)) {
                filhos[x].setId(v + "_Aba" + (x + 1));
            }
        }
    };
    this.setLargura = function (v) {
        setLargura.call(this, v);
        verificaBarraRolagem();
    };
    this.setAltura = function (v) {
        setAltura.call(this, v);
        redimConteudo();
    };
    this.getMode = function () {
        if (this.getConteiner() === null) {
            return "execucao";
        } else {
            return this.getConteiner().getMode();
        }
    };
    /**
     * @function {void} atualizaDados
     * Atualiza os dados exibidos pelo componente ap&oacute;s altera&ccedil;&atilde;o do compomente de Conexao vinculado
     */
    this.atualizaDados = function (conexao) {
        for(var i = 0; i < filhos.length; i++) filhos[i].atualizaDados(conexao);
    };
    this.vincularDados = function ___jsdialogedit_painelabas_vincularDados(conexao) {
        for(var i = 0; i < filhos.length; i++) filhos[i].vincularDados(conexao);
    };
    this.getExibeFecharAba = function () {return exibeFecharAba;};
    this.setExibeFecharAba = function (v) {
        exibeFecharAba = v;
        for(var x = 0; x < filhos.length; x++) {
            filhos[x].setExibeFechar(v);
        }
    };
    this.getMoverAbas = function () {return moverAbas;};
    this.setMoverAbas = function (v) {if (typeof v === "boolean") moverAbas = v;};
    this.getIconePadrao = function () {return iconePadrao;};
    this.setIconePadrao = function (v) {
        iconePadrao = v;
        for(var x = 0; x < filhos.length; x++) {
            filhos[x].setIconePadrao(v);
        }
    };
    this.getOnChange = function () {return onchangeSrc;};
    this.setOnChange = function (f) {onchangeSrc = f;};
    this.setOnChangeFunction = function (f) {onchange = f;};
    this.getOnClose = function () {return oncloseSrc;};
    this.setOnClose = function (f) {oncloseSrc = f;};
    this.setOnCloseFunction = function (f) {onclose = f;};
    this.getOnBeforeMove = function () {return onbeforemoveSrc;};
    this.setOnBeforeMove = function (f) {onbeforemoveSrc = f;};
    this.setOnBeforeMoveFunction = function (f) {onbeforemove = f;};
    this.getOnAfterMove = function () {return onaftermoveSrc;};
    this.setOnAfterMove = function (f) {onaftermoveSrc = f;};
    this.setOnAfterMoveFunction = function (f) {onaftermove = f;};
    this.findFilho = function (id) {
        var c = this.getFilho(id);
        var chamador = arguments[1] || "";
        
        if (c === null) { 
            for(var x = 0; x < filhos.length; x++) {
                if (filhos[x].getId() != chamador) {
                    c = filhos[x].findFilho(id, this.getId());
                    if (c !== null) break;
                }
            }
            
            if (c === null && this.getConteiner() !== null && this.getConteiner().getId() != chamador) {
                c = this.getConteiner().findFilho(id, this.getId());
            }
        }
        return c;
    };
    this.indexOf = function (c) {
        for(var x = 0; x < filhos.length; x++) if (filhos[x] === c) return x;
        return -1;
    };
    this.getFilhos = function () {return filhos;};
    this.getFilho = function (id) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getId() == id) return filhos[x];
        }
        return null;
    };
    this.addFilho = function (c) {
        if (c instanceof JSDialogEdit.PainelAbas.Aba) {
            c.setConteiner(this);
            c.setIconePadrao(iconePadrao);
            c.setExibeFechar(exibeFecharAba);
            filhos.push(c);
            if (itensInseridos < filhos.length) itensInseridos = filhos.length;
            divAbasInterno.appendChild(c.getAba());
            this.appendHTMLChild(c.getConteudo());
            verificaBarraRolagem();
            redimConteudo();
            if (filhos.length == 1) {
                filhos[0].setAbaAtiva(true);
                abaAtiva = filhos[0];
            }
        } else {
            throw "JSDialogEdit.PainelAbas: FilhoInvalidoException";
        }
    };
    this.removeFilho = function (c) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x] === c) {
                divAbasInterno.removeChild(c.getAba());
                this.removeHTMLChild(c.getConteudo());
                delete filhos[x];
                filhos.splice(x, 1);
                
                if (filhos.length === 0) {
                    abaAtiva = null;
                } else if (abaAtiva === c) {
                    if (x >= filhos.length) x = filhos.length - 1;
                    filhos[x].setAbaAtiva(true);
                    abaAtiva = filhos[x];
                }
                verificaBarraRolagem();
                break;
            }
        }
    };
    this.novaAba = function () {
        var parm = {
            "ID" : this.getId() + "_Aba" + (++itensInseridos),
            "Titulo" : "Aba " + itensInseridos
        };
        var aba = new JSDialogEdit.PainelAbas.Aba(parm);
        this.addFilho(aba);
        return aba;
    };
    this.getAbaAtiva = function () {return abaAtiva;};
    this.setAbaAtiva = function (aba) {
        if (aba instanceof JSDialogEdit.PainelAbas.Aba) {
            var e = null,
                x = this.indexOf(aba);
            if (arguments.length > 1) e = arguments[1];
            if (x === -1) return false;
            
            if (this.getMode() === "execucao" && onchange.call(self, e, abaAtiva, aba) === false) return false;
            
            for(x = 0; x < filhos.length; x++) filhos[x].setAbaAtiva(false);
            aba.setAbaAtiva(true);
            abaAtiva = aba;
            rolarAba(aba);
            return true;
        } else {
            throw "JSDialogEdit.PainelAbas: ParametroInvalidoException";
        }
    };
    this.fecharAba = function (aba) {
        if (aba instanceof JSDialogEdit.PainelAbas.Aba) {
            var x, e = null;
            
            if (this.getMode() === "edicao") return false;
            if (arguments.length > 1) e = arguments[1];
            x = this.indexOf(aba);
            if (x === -1) return false;

            if (onclose.call(self, e, aba) === false) return false;
            this.removeFilho(aba);
            
            return true;
        } else {
            throw "JSDialogEdit.PainelAbas: ParametroInvalidoException";
        }        
    };
    this.repaint = function () {
        for(var x = 0; x < filhos.length; x++) {
            if(filhos[x].repaint) {
                filhos[x].repaint();
            }
        }
    };
    this.getLayout = function () {return layout;};
    this.setLayout = function (v) {
        var elemento = this.getElemento();
        layout = v;
        
        switch(v) {
            case JSDialogEdit.Conteiner.TiposLayout.SUPERIOR:
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "0px";
                elemento.style.left = "0px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.INFERIOR:
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "";
                elemento.style.left = "0px";
                elemento.style.bottom = "0px";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.CENTRO:
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "0px";
                elemento.style.left = "0px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = "100%";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Altura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.DIREITA:
                // TODO: :(
                break;
            case JSDialogEdit.Conteiner.TiposLayout.ESQUERDA:
                // TODO: :(
                break;
            case JSDialogEdit.Conteiner.TiposLayout.NONE:
            default:
                elemento.style.MozBoxSizing = "";
                elemento.style.WebkitBoxSizing = "";
                elemento.style.boxSizing = "";
                elemento.style.top = this.getSuperior() + "px";
                elemento.style.left = this.getEsquerda() + "px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = this.getLargura() + "px";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = true;
                self.getPropriedade("Altura").habilitado = true;
                self.getPropriedade("Superior").habilitado = true;
                self.getPropriedade("Esquerda").habilitado = true;
                break;
        }
    };
    
    var redimConteudo = function () {
        var altura = self.getAltura();
        var item = self.getElemento().firstChild;
        
        if (altura < divAbas.clientHeight) return;
        
        while(item) {
            if (item.className.indexOf("jsdeTabPainelConteudo") != -1) item.style.height = (altura - divAbas.clientHeight) + "px";
            item = item.nextSibling;
        }
    };
    var verificaBarraRolagem = function () {
        divRolarDireita.style.display = "none";
        divRolarEsquerda.style.display = "none";
        divAbasInterno.style.left = "0px";
        
        if (divAbas.scrollWidth > divAbas.clientWidth) {
            divRolarDireita.style.display = "block";
            divRolarEsquerda.style.display = "block";
            rolarAba(abaAtiva);
        } else if (filhos.length > 1){
            rolarAba(filhos[0]);
        }
    };
    var rolarAba = function (aba) {
        var dx = 0;
        var viewPortSize = divAbas.clientWidth - 2;
        var contentLeft = divAbasInterno.offsetLeft;
        var itemLeft = aba.getAba().offsetLeft + contentLeft;
        var itemRight = itemLeft + aba.getAba().clientWidth;
        
        if (itemRight > viewPortSize) {
            dx = itemRight - viewPortSize;
            divAbasInterno.style.left = (contentLeft - dx) + "px";
        } else if (itemLeft < 0) {
            dx = itemLeft * (-1) + 1;
            divAbasInterno.style.left = (contentLeft + dx) + "px";
        }
    };
    var rolarDirecao = function (direcao) {
        var divAba, itemLeft, itemRight,
            contentLeft = divAbasInterno.offsetLeft,
            viewPortSize = divAbas.clientWidth - 2;
        
        for(var x = 0; x < filhos.length; x++) {
            divAba = filhos[x].getAba();
            itemLeft  = divAba.offsetLeft + contentLeft;
            itemRight = itemLeft + divAba.clientWidth;
            
            if (direcao === "direita" && itemRight > viewPortSize) {
                rolarAba(filhos[x]);
                break;
            } else if (direcao === "esquerda" && itemLeft >= 0) {
                if (x > 0) x--;
                rolarAba(filhos[x]);
                break;
            }
        }
    };
    var moverAba = function (e) {
        var dx, left, right, pos, centro, i;
        e = e || event;
        
        if (!moverAbas || !self.dragAba || filhos.length == 1 || self.getMode() === "edicao") return;
        try { if (onbeforemove.call(this, e, self.dragAba[0]) === false) return; } catch(ex) {}
        
        if (!dragging) {
            if (!dragX) dragX = e.clientX;
            dx = e.clientX - dragX;
            if (dx >= 3 || dx <= -3) {
                dragDiv = self.dragAba[0].getAba();
                self.dragAba[1].style.position = "absolute";
                self.dragAba[1].style.opacity = 0.8;
                self.dragAba[1].style.left = dragDiv.offsetLeft + "px";
                dragDiv.style.opacity = 0.01;
                divAbasInterno.appendChild(self.dragAba[1]);
                dragX = e.clientX;
                maxDragX = divAbasInterno.clientWidth - self.dragAba[1].clientWidth - 2;
                dragging = true;
                JSDialogEdit.Core.capturaEvento(window, "mouseup", fimMoverAba);
            }
        } else {
            left = parseInt(self.dragAba[1].style.left, 10) + e.clientX - dragX;
            if (left > maxDragX) {
                left = maxDragX;
            } else if (left < 0) {
                left = 0;
            } else {
                dragX = e.clientX;
            }
            self.dragAba[1].style.left = left + "px";
            right = left + self.dragAba[1].clientWidth;
            
            pos = divAbasInterno.children.length;
            for(i = 0; i < divAbasInterno.children.length - 1; i++) {
                if (divAbasInterno.children[i] == dragDiv) {
                    pos = i;
                    continue;
                }
                
                centro = divAbasInterno.children[i].clientWidth / 2 + divAbasInterno.children[i].offsetLeft;
                if (i < pos && left < centro) {
                    divAbasInterno.insertBefore(dragDiv, divAbasInterno.children[i]);
                    if (right < centro) break;
                }
                
                if (i > pos && right > centro) {
                    if (i == divAbasInterno.children.length - 2) {
                        divAbasInterno.insertBefore(dragDiv, divAbasInterno.lastChild);
                    } else {
                        divAbasInterno.insertBefore(dragDiv, divAbasInterno.children[i].nextSibling);
                    }
                    break;
                }
            }
        
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
        }
    };
    var fimMoverAba = function (e) {
        JSDialogEdit.Core.removeEvento(window, "mouseup", fimMoverAba);
        dragDiv.style.opacity = "";
        divAbasInterno.removeChild(self.dragAba[1]);
        dragging = false;
        dragX = null;
        
        try { onaftermove.call(this, e, self.dragAba[0]); } catch(ex) {}

        self.dragAba = null;
        dragDiv = null;
    };
    var init = function () {
        divRolarEsquerda = document.createElement("div");
        divRolarEsquerda.className = "jsdeTabPainelRolarEsquerda";
        divRolarEsquerda.style.display = "none";
        divRolarEsquerda.onclick = function () {rolarDirecao("esquerda");};
        
        divRolarDireita = document.createElement("div");
        divRolarDireita.className = "jsdeTabPainelRolarDireita";
        divRolarDireita.style.display = "none";
        divRolarDireita.onclick = function () {rolarDirecao("direita");};
        
        divAbasInterno = document.createElement("div");
        divAbasInterno.className = "jsdeTabPainelBarraInternaAbas";
        
        divAbas = document.createElement("div");
        divAbas.className = "jsdeTabPainelBarraAbas";
        divAbas.appendChild(divAbasInterno);
        
        self.appendHTMLChild(divRolarEsquerda);
        self.appendHTMLChild(divRolarDireita);
        self.appendHTMLChild(divAbas);
        
        self.getElemento().className = "jsdeTabPainelConteiner";
        if (!propriedades || !propriedades.Altura) self.setAltura(150);
        if (!propriedades || !propriedades.Largura) self.setLargura(150);
        
        JSDialogEdit.Core.capturaEvento(divAbasInterno, "mousemove", moverAba);
        
        self.getPropriedade("Valor").habilitado = false;
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        self.getPropriedade("Classe").habilitado = false;
        self.getPropriedade("Conector").habilitado = false;
        self.getPropriedade("Campo").habilitado = false;
        self.getPropriedade("TabIndex").habilitado = false;
        self.getPropriedade("Tooltip").habilitado = false;
        self.getPropriedade("Desabilitado").habilitado = false;
        self.getEvento("OnFocus").habilitado = false;
        self.getEvento("OnBlur").habilitado = false;
        self.getEvento("OnMouseOver").habilitado = false;
        self.getEvento("OnMouseOut").habilitado = false;
        self.getEvento("OnMouseDown").habilitado = false;
        self.getEvento("OnMouseUp").habilitado = false;
        self.getEvento("OnMouseMove").habilitado = false;
        self.getEvento("OnClick").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "ExibeFecharAba",
            "descricao" : "Exibe icone que permite ao usuario fechar as abas",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getExibeFecharAba",
            "set" : "setExibeFecharAba",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "MoverAbas",
            "descricao" : "Permite aos usuarios reordernar as abas",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getMoverAbas",
            "set" : "setMoverAbas",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "NovaAba",
            "descricao" : "Inclui uma nova aba",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Acao,
            "funcao" : "novaAba",
            "habilitado" : true,
            "refresh" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "IconePadrao",
            "descricao" : "Define um icone padrão para todas as abas",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getIconePadrao",
            "set" : "setIconePadrao",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Layout",
            "descricao" : "Layout do Componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getLayout",
            "set" : "setLayout",
            "habilitado" : false,
            "opcoes" : JSDialogEdit.Conteiner.TiposLayout
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnChange",
            "descricao" : "Evento disparado quando a Aba a ser exibida for trocada",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnChange",
            "set" : "setOnChange",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e, JSDialogEdit.PainelAbas.Aba abaAtiva, JSDialogEdit.PainelAbas.Aba aba"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnClose",
            "descricao" : "Evento disparado quando uma Aba for fechada",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnClose",
            "set" : "setOnClose",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e, JSDialogEdit.PainelAbas.Aba aba"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnBeforeMove",
            "descricao" : "Evento disparado antes de uma Aba for movida",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnBeforeMove",
            "set" : "setOnBeforeMove",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e, JSDialogEdit.PainelAbas.Aba aba"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnAfterMove",
            "descricao" : "Evento disparado apos uma Aba ser movida",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnAfterMove",
            "set" : "setOnAfterMove",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e, JSDialogEdit.PainelAbas.Aba aba"
        }));

        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.PainelAbas, JSDialogEdit.Componente);

/**
 * @class {class} JSDialogEdit.PainelAbas.Aba
 * Classe representando uma Aba para o Painel de Abas com todos os seus atributos
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente
 */
JSDialogEdit.PainelAbas.Aba = function () {
    JSDialogEdit.Conteiner.call(this, "div"); //, arguments[0]);
    
    var self = this,
        propriedades = arguments[0] || null,
        id = "",
        conteiner = null,
        aba = null,
        conteudo = null,
        drag = null,
        placehold = null,
        fechar = null,
        titulo = null,
        divIcone = null,
        icone = "",
        iconePadrao = "",
        ativa = false,
        fechada = false,
        exibeFechar = false,
        setId = this.setId,
        setTooltip = this.setTooltip,
        toObject = this.toObject,
        addFilho = this.addFilho,
        removeFilho = this.removeFilho,
        removeTodosFilhos = this.removeTodosFilhos,
        appendHTMLChild = this.appendHTMLChild,
        removeHTMLChild = this.removeHTMLChild;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.PainelAbas.Aba";
    
    /**
     * @function {JSONObject} toObject
     * Serializa o Objeto no formato JSON com os dados das Propriedades e Eventos da classe.
     * @return Objeto JSON com as informa&ccedil;&otilde;es.
     */
    this.toObject = function () {
        var obj = toObject.call(this);
        var filhos = this.getFilhos();
        
        obj.filhos = [];
        for(var x = 0; x < filhos.length; x++) obj.filhos.push(filhos[x].toObject());
        
        return obj;
    };
    this.setLargura = function () {};
    this.setAltura = function () {};
    this.setSuperior = function () {};
    this.setInferior = function () {};
    this.setEsquerda = function () {};
    this.setDireita = function () {};
    this.retornaListaCampos = function (conexao) {return conteiner.retornaListaCampos(conexao);};
    this.retornaListaConexaoXML = function (conexao) {return conteiner.retornaListaConexaoXML(conexao);};
    this.getMode = function () {return conteiner.getMode();};
    this.addFilho = function (c) {
        addFilho.call(this, c);
        conteudo.appendChild(c.getElemento());
    };
    this.removeFilho = function (c) {
        removeFilho.call(this, c);
        this.removeHTMLChild(c.getElemento());
    };
    this.removeTodosFilhos = function (c) {
        removeTodosFilhos.call(this);
        var filhos = conteudo.children;
        for(var x = filhos.length - 1; x >= 0; x--) {
            this.removeHTMLChild(filhos[x]);
        }
    };
    this.appendHTMLChild = function (c){conteudo.appendChild(c);};
    this.removeHTMLChild = function (c){conteudo.removeChild(c);};
    this.findFilho = function (id) {
        var c = this.getFilho(id);
        var chamador = arguments[1] || "";
        var filhos = this.getFilhos();
        
        if (c === null) { 
            for(var x = 0; x < filhos.length; x++) {
                if (filhos[x].findFilho && filhos[x].getId() != chamador) {
                    c = filhos[x].findFilho(id, this.getId());
                    if (c !== null) break;
                }
            }
            
            if (c === null && conteiner !== null && conteiner.getId() != chamador) {
                c = conteiner.findFilho(id, this.getId());
            }
        }
        return c;
    };
    /**
     * @function {void} setTooltip
     * Define o texto para o Tooltip/Title do Componente
     * @param {String} v Texto exibido na caixa de dica
     */
    this.setTooltip    = function (v) {aba.title = tooltip = v;};
    this.getConteudo  = function ()  {return conteudo;};
    this.getConteiner  = function ()  {return conteiner;};
    this.setConteiner  = function (c)  {
        if (!(c instanceof JSDialogEdit.PainelAbas)) throw "JSDialogEdit.PainelAba.Aba: ConteinerInvalidoException";
        conteiner = c;
    };
    this.getId = function () {return id;};
    this.setId = function (v) {
        id = v;
        conteudo.id = v + "_conteudo";
        aba.id = v + "_aba";
        titulo.id = v + "_titulo";
        icone.id = v + "_icone";
        fechar.id = v + "_fechar";
    };
    this.getTitulo = function () {return titulo.innerHTML;};
    this.setTitulo = function (v) {titulo.innerHTML = v;};
    this.getExibeFechar = function () {return exibeFechar;};
    this.setExibeFechar = function (v) {
        exibeFechar = v;
        fechar.style.display = v ? "" : "none";
    };
    this.getIcone = function () {return icone;};
    this.setIcone = function (v) {
        icone = v;
        if (v !== "") {
            divIcone.style.backgroundImage = "url(" + v + ")";
            divIcone.style.display = "";
        } else if (iconePadrao !== "") {
            divIcone.style.backgroundImage = "url(" + iconePadrao + ")";
            divIcone.style.display = "";
        } else {
            divIcone.style.backgroundImage = "none";
            divIcone.style.display = "none";
        }
    };
    this.setIconePadrao = function (v) {
        iconePadrao = v;
        if (icone === "") {
            if (iconePadrao !== "") {
                divIcone.style.backgroundImage = "url(" + v + ")";
                divIcone.style.display = "";
            } else {
                divIcone.style.backgroundImage = "none";
                divIcone.style.display = "none";
            }
        }
    };
    this.getAba = function () {return aba;};
    this.getConteudo = function () {return conteudo;};
    this.fecharAba = function (e) {
        e = e || event;
        fechada = conteiner.fecharAba(self, e);
    };
    this.setAbaAtiva = function (v) {
        ativa = v;
        var x, filhos = this.getFilhos();
        
        if (v) {
            aba.className += " jsdeTabPainelAbaAtiva";
            conteudo.style.display = "block";
            
            for(x = 0; x < filhos.length; x++) {
                if(filhos[x].repaint) {
                    filhos[x].repaint();
                }
            }
        } else {
            aba.className = aba.className.replace(" jsdeTabPainelAbaAtiva", "");
            conteudo.style.display = "none";
        }
        
        conteudo.className += ""; // POG IE8-
    };
    this.isAtiva = function (){return ativa;};
    
    var ativarAba = function (e) {
        e = e || event;
        if (fechada || ativa) return;
        conteiner.setAbaAtiva(self, e);
    };
    var init = function () {
        titulo = document.createElement("div");
        titulo.className = "jsdeTabPainelAbaTitulo";
        
        divIcone = document.createElement("div");
        divIcone.className = "jsdeTabPainelAbaIcone";
        divIcone.style.display = "none";
        
        fechar = document.createElement("div");
        fechar.className = "jsdeTabPainelAbaFechar";
        fechar.style.display = "none";
        fechar.onclick = self.fecharAba;
        
        aba = document.createElement("div");
        aba.className = "jsdeTabPainelAba";
        aba.onmousedown = ativarAba;
        aba.appendChild(divIcone);
        aba.appendChild(fechar);
        aba.appendChild(titulo);
        JSDialogEdit.Core.capturaEvento(aba, "mousedown", function (e) {
            placehold = aba.cloneNode(true);
            placehold.id = "cloneDragAba_" + self.getId();
            if (conteiner) conteiner.dragAba = [self, placehold];
        });
        JSDialogEdit.Core.capturaEvento(aba, "mouseup", function (e) {
            placehold = null;
            if (conteiner) conteiner.dragAba = null;
        });
        
        conteudo = self.getElemento();
        conteudo.className = "jsdeTabPainelConteudo";
        
        self.getPropriedade("Valor").habilitado = false;
        self.getPropriedade("Largura").habilitado = false;
        self.getPropriedade("Altura").habilitado = false;
        self.getPropriedade("Superior").habilitado = false;
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Esquerda").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        self.getPropriedade("Classe").habilitado = false;
        self.getPropriedade("Estilos").habilitado = false;
        self.getPropriedade("TabIndex").habilitado = false;
        self.getPropriedade("Desabilitado").habilitado = false;
        self.getPropriedade("Visivel").habilitado = false;
        self.getPropriedade("Layout").habilitado = false;
        self.getEvento("OnFocus").habilitado = false;
        self.getEvento("OnBlur").habilitado = false;
        self.getEvento("OnMouseOver").habilitado = false;
        self.getEvento("OnMouseOut").habilitado = false;
        self.getEvento("OnMouseDown").habilitado = false;
        self.getEvento("OnMouseUp").habilitado = false;
        self.getEvento("OnMouseMove").habilitado = false;
        self.getEvento("OnClick").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Titulo",
            "descricao" : "Titulo da Aba",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getTitulo",
            "set" : "setTitulo",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Icone",
            "descricao" : "Define o icone a ser exibido nesta aba",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getIcone",
            "set" : "setIcone",
            "habilitado" : true
        }));
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
    return this;
};
JSDialogEdit.Core.register(JSDialogEdit.PainelAbas.Aba, JSDialogEdit.Conteiner);

/**
 * @class {class} JSDialogEdit.Ajax
 * Classe utilizada para realizar requisi&ccedil;&otilde;es ao servidor tanto de forma assincrona, quanto sincronas.
 * A requisi&ccedil;&atilde;o pode utilizar os metodos GET ou POST do HTTP, alem de permitir o envio de dados tanto de um HTMLFormElement quanto de um objeto JSON.
 * O retorno das requisi&ccedil;&otilde;es podem ser HTML, XML, JSON ou texo puro.
 * Possui manipulador para tratamento de erros e metodos de "callback" para a resposta do servidor.
 * @constructor JSDialogEdit.Ajax Cria um novo objeto para requisi&ccedil;&otilde;es AJAX
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente
 */
JSDialogEdit.Ajax = function () {
  JSDialogEdit.Objeto.call(this);
  
  var sAjax = this,
      propriedades = arguments[0] || null,
      elemento = null,
      design = null,
      conteiner = null,
      xmlhttp,
      conteudo,
      metodoSrc = "",
      erroSrc = "",
      setId = this.setId;
  
  /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
  this.CLASSE = "JSDialogEdit.Ajax";
  /** @property {String} url Caminho da p&aacute;gina a ser requisitada pelo AJAX. */
  this.url = null;
  /** @property {JSONObject} dados Objeto JSON com os dados a serem enviados com a requisi&ccedil;&atilde;o. */
  this.dados = null;
  /** @property {HTMLFormElement} frm Formulario HTML de onde os dados ser&atilde;o lidos e enviados com a requisi&ccedil;&atilde;o. */
  this.frm = null;
  /** @property {function} metodo Fun&ccedil;&atilde;o de "callback" a ser chamada apos a conclusao da requisi&ccedil;&atilde;o AJAX. */
  this.metodo = null;
  /** @property {function} erro Fun&ccedil;&atilde;o de "callback" a ser chamada caso algum erro HTTP na requisi&ccedil;&atilde;o. */
  this.erro = function (mensagem, codigo){ };
  /** @property {boolean} assincrono Define se a requisi&ccedil;&atilde;o ser&aacute; feita em modo Assincrono ou n&atilde;o. */
  this.assincrono = true;
  /** @property {String} resultado Resultado retornado pelo servidor. */
  this.resultado = null;
  /** @property {String} tipoRequisicao Define se a requisi&ccedil;&atilde;o ser&aacute; enviada usando o m&eacute;todo HTTP "POST" ou "GET". */
  this.tipoRequisicao = null;
  this.eventoPadrao = "AfterSubmit";
  
  /**
   * @function {void} request
   * Requisita uma p&aacute;gina utilizando por padr&atilde;o: m&eacute;todo HTTP GET e enviando todas as informa&ccedil;&otilde;es junto da URL (Query String)
   * A forma de requisi&ccedil;&atilde;o pode ser alterada conforme os parametros informados:
   * @param {JSONObject} parametros JSON do tipo {Chave:Valor} com as informa&ccedil;&otilde;es para a requisi&ccedil;&atilde;o:
   * <ul>
   * <li><i>String</i><b>url</b> : endereco da p&aacute;gina a ser requisitada
   * <li><i>String</i><b>tipoRequisicao</b> : m&eacute;todo HTTP utilizado para requisitar a url: POST/GET
   * <li><i>JSONObject</i><b>dados</b> : Objeto JSON {Chave:Valor} com os dados a serem enviados no corpo da requisi&ccedil;&atilde;o
   * <li><i>boolean</i><b>assincrono</b> : define se a requisi&ccedil;&atilde;o ser&aacute; assincrono 
   * <li><i>HTMLFormElement</i><b>form</b> : Formulario HTML que deve ser enviado com a requisi&ccedil;&atilde;o
   * <li><i>function</i><b>metodo</b> : fun&ccedil;&atilde;o JavaScript que ser&aacute; executada apos o retorno sem erro da requisi&ccedil;&atilde;o
   * <li><i>function</i><b>erro</b> : fun&ccedil;&atilde;o JavaScript que ser&aacute; executada caso ocorra um erro na requisi&ccedil;&atilde;o
   * </ul>
   */
  this.request = function (parametros) {
    if (parametros) {
        if (parametros.url)            this.url            = parametros.url;
        if (parametros.tipoRequisicao) this.tipoRequisicao = parametros.tipoRequisicao;
        if (parametros.dados)          this.dados          = parametros.dados;
        if (parametros.assincrono)     this.assincrono     = parametros.assincrono;
        if (parametros.form)           this.frm            = parametros.form;
        if (parametros.metodo)         this.metodo         = parametros.metodo;
        if (parametros.erro)           this.erro           = parametros.erro;
    }
    
    if (this.tipoRequisicao === null) this.tipoRequisicao = "GET";
    
    montaConteudo();
    if (conteudo !== null && this.tipoRequisicao === "GET") this.url += "?" + conteudo;
    
    xmlhttp.open(this.tipoRequisicao, this.url, this.assincrono);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
    xmlhttp.setRequestHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    xmlhttp.setRequestHeader("Pragma", "no-cache");
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                sAjax.resultado = xmlhttp.responseText;
                sAjax.resultado=unescape(sAjax.resultado);
                if (sAjax.metodo) sAjax.metodo(sAjax.resultado);
            } else {
                sAjax.resultado = xmlhttp.responseText;
                if (sAjax.erro) sAjax.erro(sAjax.resultado, xmlhttp.status);
            }
        }
    };
    
    if (this.tipoRequisicao === "GET") {
        xmlhttp.send(null);
    } else {
        xmlhttp.send(conteudo);
    }
  };
  
  /**
   * @function {void} post
   * Requisita uma p&aacute;gina utilizando o m&eacute;todo HTTP POST, enviando os dados de um formulario no corpo da requisi&ccedil;&atilde;o
   * @param {JSONObject} parametros Objeto JSON do tipo {Chave:Valor} com as informa&ccedil;&otilde;es para a requisi&ccedil;&atilde;o:
   * <ul>
   * <li><i>URI</i><b>url</b> : endereco da p&aacute;gina a ser requisitada.</li>
   * <li><i>boolean</i><b>assincrono</b> : define se a requisi&ccedil;&atilde;o ser&aacute; assincrono.</li>
   * <li><i>function</i><b>metodo</b> : fun&ccedil;&atilde;o JavaScript que ser&aacute; executada apos o retorno sem erro da requisi&ccedil;&atilde;o.</li>
   * <li><i>function</i><b>erro</b> : fun&ccedil;&atilde;o JavaScript que ser&aacute; executada caso ocorra um erro na requisi&ccedil;&atilde;o.</li>
   * <li><i>HTMLFormElement</i><b>form</b> : formulario HTML com os dados a serem enviados no corpo da requisi&ccedil;&atilde;o.</li>
   * </ul>
   */
  this.post = function (parametros) {
    if (parametros) {
        if (parametros.url) this.url = parametros.url;
        if (parametros.form) this.frm = parametros.form;
        if (parametros.metodo) this.metodo = parametros.metodo;
        if (parametros.erro) this.erro = parametros.erro;
        if (parametros.assincrono) this.assincrono = parametros.assincrono;
    }
    
    montaConteudo();
    
    xmlhttp.open("POST",this.url,this.assincrono);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
    xmlhttp.setRequestHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    xmlhttp.setRequestHeader("Pragma", "no-cache");
    xmlhttp.send(conteudo);
    if (this.assincrono) {
        xmlhttp.onreadystatechange = function () {
          if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
              sAjax.resultado = xmlhttp.responseText;
              if (sAjax.metodo) sAjax.metodo(sAjax.resultado);
            } else {
              sAjax.resultado = xmlhttp.responseText;
              if (sAjax.erro) sAjax.erro(sAjax.resultado, xmlhttp.status);
            }
          }
        };
    } else {
      sAjax.resultado = xmlhttp.responseText;
      sAjax.resultado = unescape(sAjax.resultado);
      if (sAjax.metodo) sAjax.metodo(sAjax.resultado);
    }
  };
  
  /**
   * @function {void} postDados
   * Requisita uma p&aacute;gina utilizando o m&eacute;todo HTTP POST, enviando os dados informados no corpo da requisi&ccedil;&atilde;o
   * @param {JSONObject} parametros Objeto JSON do tipo {Chave:Valor} com as informa&ccedil;&otilde;es para a requisi&ccedil;&atilde;o:
   * <ul>
   * <li><i>URI</i><b>url</b> : endereco da p&aacute;gina a ser requisitada.</li>
   * <li><i>boolean</i><b>assincrono</b> : define se a requisi&ccedil;&atilde;o ser&aacute; assincrono.</li>
   * <li><i>Function</i><b>metodo</b> : fun&ccedil;&atilde;o JavaScript que ser&aacute; executada apos o retorno sem erro da requisi&ccedil;&atilde;o.</li>
   * <li><i>Function</i><b>erro</b> : fun&ccedil;&atilde;o JavaScript que ser&aacute; executada caso ocorra um erro na requisi&ccedil;&atilde;o.</li>
   * <li><i>JSONObject</i><b>dados</b> : Objeto JSON {Chave:Valor} com os dados a serem enviados no corpo da requisi&ccedil;&atilde;o.</li>
   * </ul>
   */
  this.postDados = function (parametros) {
    if (parametros) {
        if (parametros.url) this.url = parametros.url;
        if (parametros.dados) this.dados = parametros.dados;
        if (parametros.metodo) this.metodo = parametros.metodo;
        if (parametros.erro) this.erro = parametros.erro;
        if (parametros.assincrono) this.assincrono = parametros.assincrono;
    }
    
    montaConteudo();
    
    xmlhttp.open("POST",this.url,this.assincrono);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
    xmlhttp.setRequestHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    xmlhttp.setRequestHeader("Pragma", "no-cache");
    xmlhttp.send(conteudo);
    if (this.assincrono) {
        xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    sAjax.resultado = xmlhttp.responseText;
                    sAjax.resultado = unescape(sAjax.resultado);
                    if (sAjax.metodo) sAjax.metodo(sAjax.resultado);
                } else {
                    sAjax.resultado = xmlhttp.responseText;
                    sAjax.resultado = unescape(sAjax.resultado);
                    if (sAjax.erro) sAjax.erro(sAjax.resultado, xmlhttp.status);
                }
            }
        };
    } else {
      sAjax.resultado = xmlhttp.responseText;
      sAjax.resultado = unescape(sAjax.resultado);
      if (sAjax.metodo) sAjax.metodo(sAjax.resultado);
    }
  };

  /**
   * @function {void} requestXML
   * Requisita uma p&aacute;gina XML de acordo com os parametros passados
   * @param {JSONObject} parametros Objeto JSON do tipo {Chave:Valor} com as informa&ccedil;&otilde;es para a requisi&ccedil;&atilde;o:
   * <ul>
   * <li><i>URI</i><b>url</b> : endereco do arquivo XML a ser requisitado.</li>
   * <li><i>boolean</i><b>assincrono</b> : define se a requisi&ccedil;&atilde;o ser&aacute; assincrono.</li>
   * <li><i>string</i><b>tipoRequisicao</b> : m&eacute;todo HTTP utilizado para requisitar a url: POST/GET.</li>
   * <li><i>function</i><b>metodo</b> : fun&ccedil;&atilde;o JavaScript que ser&aacute; executada apos o retorno sem erro da requisi&ccedil;&atilde;o.</li>
   * <li><i>function</i><b>erro</b> : fun&ccedil;&atilde;o JavaScript que ser&aacute; executada caso ocorra um erro na requisi&ccedil;&atilde;o.</li>
   * <li><i>JSONObject</i><b>dados</b> : Objeto JSON {Chave:Valor} com os dados a serem enviados no corpo da requisi&ccedil;&atilde;o.</li>
   * </ul>
   */
  this.requestXML = function ___jsdialogedit_ajax_requestxml(parametros) {
    if (parametros) {
        if (parametros.url !== undefined) this.url = parametros.url;
        if (parametros.metodo !== undefined) this.metodo = parametros.metodo;
        if (parametros.erro !== undefined) this.erro = parametros.erro;
        if (parametros.assincrono !== undefined) this.assincrono = parametros.assincrono;
        if (parametros.dados !== undefined) this.dados = parametros.dados;
        if (parametros.tipoRequisicao) this.tipoRequisicao = parametros.tipoRequisicao;
    }
    
    montaConteudo();
    if (this.tipoRequisicao === null) this.tipoRequisicao = "GET";
    if (conteudo !== null && this.tipoRequisicao.toLowerCase() == "get") this.url += "?" + conteudo;

    xmlhttp.open(this.tipoRequisicao,this.url,this.assincrono);
    xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=iso-8859-1;");
    xmlhttp.setRequestHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    xmlhttp.setRequestHeader("Pragma", "no-cache");
    xmlhttp.send(conteudo);
    if (this.assincrono) {
        xmlhttp.onreadystatechange = processaRespostaXML;
    } else {
        if (xmlhttp.status == 200) {
            if (!xmlhttp.responseXML.documentElement && xmlhttp.responseStream) {
              xmlhttp.responseXML.load(xmlhttp.responseStream);
            }
            sAjax.resultado = xmlhttp.responseXML;
            if (sAjax.metodo) sAjax.metodo(sAjax.resultado);
        } else if (sAjax.erro) sAjax.erro(xmlhttp.responseText, xmlhttp.status);
    }
  };
  this.testar = function () {
    this.request({
        "metodo" : function (result) {
            JSDialogEdit.Janela.Mensagem({
                "mensagem" : result
                    .replace(/>/g, "&gt;")
                    .replace(/</g, "&lt;"),
                "icone" : JSDialogEdit.Janela.Mensagem.Icone.OK
            });
        },
        "erro" : function (result) {
            JSDialogEdit.Janela.Mensagem({
                "mensagem" : result
                    .replace(/>/g, "&gt;")
                    .replace(/</g, "&lt;"),
                "icone" : JSDialogEdit.Janela.Mensagem.Icone.ERRO
            });
        }
    });
  };
  var processaRespostaXML = function () {
      if (xmlhttp.readyState == 4) {
        switch(xmlhttp.status) {
          case 200:
            if (!xmlhttp.responseXML.documentElement && xmlhttp.responseStream) {
              xmlhttp.responseXML.load(xmlhttp.responseStream);
            }

            sAjax.resultado = xmlhttp.responseXML;
            if (sAjax.metodo) sAjax.metodo(sAjax.resultado);
            break;
          case 404:
            //alert("Erro 404 - Pagina nao localizada: " + sAjax.url)
            if (sAjax.erro) sAjax.erro(xmlhttp.responseText, xmlhttp.status);
            break;
          case 500:
            //alert("Erro 500 - Erro interno do servidor: " + sAjax.url + "\n" + xmlhttp.responseText)
            if (sAjax.erro) sAjax.erro(xmlhttp.responseText, xmlhttp.status);
            break;
          default:
            //alert("Erro " + xmlhttp.status + ":" + sAjax.url + "\n" + xmlhttp.responseText)
            if (sAjax.erro) sAjax.erro(xmlhttp.responseText, xmlhttp.status);
            break;
        }
      }
  };

  this.getUrl = function () {return this.url;};
  this.setUrl = function (v) {this.url = v;};
  this.getAssincrono = function () {return this.assincrono;};
  this.setAssincrono = function (v) {this.assincrono = v;};
  this.getTipoRequisicao = function () {return this.tipoRequisicao ? this.tipoRequisicao : "GET";};
  this.setTipoRequisicao = function (v) {this.tipoRequisicao = v;};
  this.getElemento = function () {return elemento;};
  this.getElementoDesign = function () {return design;};
  this.getConteiner  = function () {return conteiner;};
  this.setConteiner  = function (v)  {conteiner = v;};
  this.setId = function (v) {
    if (v === "") return;
    setId.call(this, v);
    elemento.name = v;
    elemento.id = v;
    design.id = v;
  };
    
  this.getAfterSubmit = function () {return metodoSrc;};
  this.setAfterSubmit = function (v) {metodoSrc = v;};
  this.setAfterSubmitFunction = function (v) {this.metodo = v;};
  this.getErrorSubmit = function () {return erroSrc;};
  this.setErrorSubmit = function (v) {erroSrc = v;};
  this.setErrorSubmitFunction = function (v) {this.erro = v;};
  /**
  * @function {void} parseElemento
  * Utilizado internamente para processar os c&oacute;digos fonte gerados pelo Editor.
  * Realiza o processamento deste Componente em um elemento DOM.HTMLElement, podendo assim ser inserido em p&aacute;gina.
  */
  this.parseElemento = function () {
    this.metodo = new Function("retorno", sAjax.getAfterSubmit());
    this.erro = new Function("mensagem", "codigo", sAjax.getErrorSubmit());
  };

  var montaConteudo = function () {
    var item = "";
    conteudo = "";
    
    if (sAjax.dados) {
        for(item in sAjax.dados) {
            if (conteudo !== "") conteudo += "&";
            conteudo += item + "=" + sAjax.dados[item];
        }
    }
    
    if (sAjax.frm) {
        for(var x = 0; x < sAjax.frm.length; x++) {
            item = sAjax.frm.elements[x];
            if (item.name !== "") {
                if (item.value === undefined) continue;
                if ((item.type === "checkbox" || item.type === "radio") && !item.checked) continue;
                if (conteudo !== "") conteudo += "&";
                conteudo += item.name + "=" + escape(item.value);
            }
        }
    }
    
    if (conteudo === "") conteudo = null;
  };

  var init = function () {
    elemento = document.createElement("input");
    elemento.type = "hidden";
    design = document.createElement("img");
    design.src = JSDialogEdit.pastaImagens + "Ajax.png";
        
    try {
        xmlhttp = new XMLHttpRequest();
    } catch(ee) {
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch(e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch(eee) {
                xmlhttp = false;
                alert("ERRO!!!!\nNao foi possivel criar Objeto ou navegador nao suporta AJAX");
            }
        }
    }

    sAjax.addPropriedade(new JSDialogEdit.Propriedade({
        "nome" : "URL",
        "descricao" : "Caminho da pagina a ser requisitada pelo AJAX",
        "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
        "get" : "getUrl",
        "set" : "setUrl",
        "habilitado" : true
    }));
    sAjax.addPropriedade(new JSDialogEdit.Propriedade({
        "nome" : "Assincrono",
        "descricao" : "Define se a requisicao sera feita em modo Assincrono ou nao",
        "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
        "get" : "getAssincrono",
        "set" : "setAssincrono",
        "habilitado" : true
    }));
    sAjax.addPropriedade(new JSDialogEdit.Propriedade({
        "nome" : "TipoRequisicao",
        "descricao" : "Define se a requisicao sera enviada usando o metodo HTTP \"POST\" ou \"GET\"",
        "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
        "get" : "getTipoRequisicao",
        "set" : "setTipoRequisicao",
        "opcoes" : JSDialogEdit.Ajax.TiposMetodo,
        "habilitado" : true
    }));
    sAjax.addPropriedade(new JSDialogEdit.Propriedade({
        "nome" : "Testar",
        "descricao" : "Executa a requisicao",
        "tipo" : JSDialogEdit.Propriedade.Tipos.Acao,
        "funcao" : "testar",
        "habilitado" : true,
        "refresh" : false
    }));
    sAjax.addEvento(new JSDialogEdit.Propriedade({
        "nome" : "AfterSubmit",
        "descricao" : "Evento ocorrido logo apos o servidor responder a requisicao",
        "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
        "get" : "getAfterSubmit",
        "set" : "setAfterSubmit",
        "habilitado" : true,
        "retorno" : "void",
        "parametros" : "String retorno"
    }));
    sAjax.addEvento(new JSDialogEdit.Propriedade({
        "nome" : "ErrorSubmit",
        "descricao" : "Evento ocorrido caso o servidor retorne erro a requisicao",
        "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
        "get" : "getErrorSubmit",
        "set" : "setErrorSubmit",
        "habilitado" : true,
        "retorno" : "void",
        "parametros" : "String mensagem, String codigo"
    }));
    
    
    if (propriedades) {
        for(var item in propriedades) {
            sAjax.set(item, propriedades[item]);
        }
    }
  };
  
  init();
};
JSDialogEdit.Core.register(JSDialogEdit.Ajax, JSDialogEdit.Objeto);

/**
 * @struct {static final JSONObject} JSDialogEdit.Ajax.TiposMetodo
 * Lista est&aacute;tica com as formas de requisitar uma URL, tendo os seguintes valores possiveis:
 * <ul>
 * <li><b>POST</b> Realiza uma requisi&ccedil;&atilde;o utilizando o m&eacute;todo HTTP POST.
 * O valor do cabe&ccedil;alho "Content Type" ser&aacute; application/x-www-form-urlencoded.
 * <li><b>GET</b> Realiza uma requisi&ccedil;&atilde;o utilizando o m&eacute;todo HTTP GET.
 * </ul>
*/
JSDialogEdit.Ajax.TiposMetodo = {"POST":"POST", "GET":"GET"};

/**
 * @class {class} JSDialogEdit.Tabela
 * Classe representando uma Tabela (Grid) com todos os seus atributos
 * @constructor JSDialogEdit.Tabela Cria um novo objeto
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente
 */
JSDialogEdit.Tabela = function () {
    JSDialogEdit.Componente.call(this, "table");
    
    var self = this,
        propriedades = arguments[0] || null,
        id = "",
        cabecalho = null,
        corpo = null,
        rodape = null,
        divInterno = null,
        tabelaInterna = null,
        divAvisos = null,
        itensInseridos = 0,
        filhos = [],
        autoVincular = false,
        dragging = false,
        dragDiv = null,
        dragX = null,
        maxDragX = 0,
        maxRegistros = 50,
        movendoUltimaColuna = false,
        larguraMininaColuna = 22,
        campoChave = "",
        registroPagina = 10,
        paginaAtual = 0,
        registros = null,
        linhas = [],
        linhasSelecionadas = [],
        larguraDados = [],
        podeRedimensionar = true,
        moverColunas = false,
        grade = 0,
        gradeRedutor = 3,
        atualizaLargura = null,
        filtro = null,
        posFiltro = 0,
        ultimoFiltro = -1,
        timeoutFiltro = null,
        exibeRegistroCallback = null,
        layout = JSDialogEdit.Conteiner.TiposLayout.NONE,
        onchangerowselectedSrc = "",
        onchangerowselected = function (row){},
        ondataboundSrc = "",
        ondatabound = function (row){},
        onbeforemoveSrc = "",
        onbeforemove = function (e, coluna) {},
        onaftermoveSrc = "",
        onaftermove = function (e, coluna) {},
        oneditrowSrc = "",
        oneditrow = function (row) {},
        toObject = this.toObject,
        setId = this.setId,
        setConector = this.setConector,
        setLargura = this.setLargura,
        setAltura = this.setAltura,
        parseElemento = this.parseElemento,
        timeout = null,
        tempoCargaTotal, linhaRegistro,
        limiteTimeout = 2;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Tabela";
    this.eventoPadrao = "OnDataBound";
    this.dragColuna = null;
    
    /**
     * @function {JSONObject} toObject
     * Serializa o Objeto no formato JSON com os dados das Propriedades e Eventos da classe.
     * @return Objeto JSON com as informa&ccedil;&otilde;es.
     */
    this.toObject = function () {
        var obj = toObject.call(this);
        obj.filhos = [];
        for(var x = 0; x < filhos.length; x++) obj.filhos.push(filhos[x].toObject());
        return obj;
    };
    this.parseElemento = function () {
        parseElemento.call(this);
        onchangerowselected = new Function("row", self.getOnChangeRowSelected());
        ondatabound = new Function("row", self.getOnDataBound());
        onbeforemove = new Function("e", "coluna", self.getOnBeforeMove());
        onaftermove = new Function("e", "coluna", self.getOnAfterMove());
        oneditrow = new Function("row", self.getOnEditRow());
    };
    this.setId = function (v) {
        setId.call(this, v);
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getId().indexOf(id + "_Coluna" ) === 0) {
                filhos[x].setId(v + "_Coluna" + (x + 1));
            }
        }
        id = v;
    };
    this.getMode = function () {return this.getConteiner() !== null ? this.getConteiner().getMode() : null;};
    this.setConector = function (v) {
        setConector.call(self, v);
    };
    this.setAltura = function (v) {
        setAltura.call(this, v);
        redimensionar();
    };
    this.setLargura = function (v) {
        if (isNaN(v) || v <= 0) return;
        setLargura.call(this, v);
        divInterno.style.width = (v - 2) + "px";
        divAvisos.style.width = (v - 2 * JSDialogEdit.scrollWidth - 2) + "px";
        tabelaInterna.style.width = (v - JSDialogEdit.scrollWidth - 2) + "px";
    };
    this.getFilhos = function () {return filhos;};
    this.getFilho = function (id) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getId() == id) return filhos[x];
        }
        return null;
    };
    this.addFilho = function (c) {
        if (c instanceof JSDialogEdit.Tabela.Coluna) {
            c.setConteiner(this);
            filhos.push(c);
            c.getPropriedade("Campo").habilitado = !autoVincular;
            c.getPropriedade("Largura").habilitado = !autoVincular;
            if (itensInseridos < filhos.length) itensInseridos = filhos.length;
            cabecalho.firstChild.appendChild(c.getElemento());
            rodape.firstChild.appendChild(document.createElement("th"));
            rodape.rows[0].cells[filhos.length-1].appendChild(document.createElement("div"));
            corpo.rows[0].cells[0].colSpan = filhos.length;
            
            if (filhos.length == 1) redimensionar();
            //this.setLargura(this.getElemento().clientWidth);
        } else {
            throw "JSDialogEdit.Tabela: FilhoInvalidoException";
        }
    };
    this.removeFilho = function (c) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x] === c) {
                cabecalho.firstChild.removeChild(c.getElemento());
                delete filhos[x];
                filhos.splice(x, 1);
                rodape.firstChild.removeChild(rodape.firstChild.cells[x]);
                break;
            }
        }
        if (this.getElemento().clientWidth < this.getLargura()) this.setLargura(this.getElemento().clientWidth);
        corpo.rows[0].cells[0].colSpan = filhos.length;
        if (filhos.length === 0) redimensionar();
    };
    this.removeTodosFilhos = function () {
        while(filhos.length > 0) {
            cabecalho.firstChild.removeChild(filhos[0].getElemento());
            delete filhos[0];
            filhos.splice(0, 1);
            rodape.firstChild.removeChild(rodape.firstChild.cells[0]);
        }
        corpo.rows[0].cells[0].colSpan = filhos.length;
        redimensionar();
    };
    this.indexOf = function (c) {
        for(var x = 0; x < filhos.length; x++) if (c === filhos[x]) return x;
        return -1;
    };
    this.novaColuna = function () {
        var parm = {"ID":this.getId() + "_Coluna" + (++itensInseridos), "Titulo":"Coluna " + itensInseridos};
        var coluna = new JSDialogEdit.Tabela.Coluna(parm);
        this.addFilho(coluna);
        return coluna;
    };
    this.getCampoChave = function () {return campoChave;};
    this.setCampoChave = function (v) {campoChave = v;};
    this.getGrade = function () {return grade;};
    this.setGrade = function (v) {
        if (isNaN(v)) return;
        v = parseInt(v, 10);
        if (v < 0 || v > 3) return;
        grade = v;
        
        tabelaInterna.className = tabelaInterna.className
                                  .replace(" jsdeTabelaInternaGradeHorizontal","")
                                  .replace(" jsdeTabelaInternaGradeVertical","");
        
        switch(v) {
            case JSDialogEdit.Tabela.Grade.VERTICAL:
                tabelaInterna.className += " jsdeTabelaInternaGradeVertical";
                break;
            case JSDialogEdit.Tabela.Grade.HORIZONTAL:
                tabelaInterna.className += " jsdeTabelaInternaGradeHorizontal";
                break;
            case JSDialogEdit.Tabela.Grade.AMBOS:
                tabelaInterna.className += " jsdeTabelaInternaGradeVertical";
                tabelaInterna.className += " jsdeTabelaInternaGradeHorizontal";
                break;
            case JSDialogEdit.Tabela.Grade.NENHUMA:
            default:
                break;
        }
    };
    this.getCabecalho = function (){return cabecalho.style.display !== "none";};
    this.setCabecalho = function (v) {
        if (typeof v !== "boolean") return;
        cabecalho.style.display = (v ? "" : "none");
        redimensionar();
    };
    this.getRodape = function (){return rodape.style.display !== "none";};
    this.setRodape = function (v) {
        if (typeof v !== "boolean") return;
        rodape.style.display = (v ? "" : "none");
        redimensionar();
    };
    this.getAutoVincular = function () {return autoVincular;};
    this.setAutoVincular = function (v) {
        if (typeof v !== "boolean") return;
        
        autoVincular = v;
        for(var x = 0; x < filhos.length; x++) {
            if (autoVincular && filhos[x].getCampo() !== "") {
                this.removeFilho(filhos[x]); // remove colunas ja vinculadas
                x--;
            } else {
                filhos[x].getPropriedade("Campo").habilitado = !autoVincular;
                filhos[x].getPropriedade("Largura").habilitado = !autoVincular;
            }
        }
    };
    this.atualizaDados = function ___jsdialogedit_tabela_atualizaDados() {
        while(tabelaInterna.rows.length > 0) tabelaInterna.deleteRow(-1);
        linhasSelecionadas = [];
        populaGrid();
    };
    this.vincularDados = function ___jsdialogedit_tabela_vincularDados() {
        if (this.getConector() !== "") {
            limpaGrid();
            registros = this.getObjetoConector().getDados();
            populaGrid();
        }
    };
    this.setLagurgaColuna = function (coluna, largura) {
        var indice, delta, colLado, larColLado;
        
        if (this.getMode() === "execucao" && !podeRedimensionar) return;
        if (largura <= 0) return;
        
        indice = this.indexOf(coluna);
        if (indice === -1) return;
        
        if(largura < larguraMininaColuna) {
            largura = larguraMininaColuna;
            if(coluna.getLargura() == largura) return;
        }
        
        delta = largura - filhos[indice].getLargura();
        colLado = filhos[indice + 1];
        larColLado = colLado.getLargura() - delta;
        
        if(indice == filhos.length - 2 && larColLado < JSDialogEdit.scrollWidth + larguraMininaColuna) {
            return;
        } else if(larColLado < larguraMininaColuna) {
            larColLado = larguraMininaColuna;
            delta = colLado.getLargura() - larColLado;
            largura = filhos[indice].getLargura() + delta;
        }
        
        coluna.setLargura(largura);
        colLado.setLargura(larColLado);
        
        if (indice == filhos.length - 2) {
            larColLado -= JSDialogEdit.scrollWidth;
        }
        
        if (registros !== null) {
            if (atualizaLargura) {
                window.clearTimeout(atualizaLargura);
                atualizaLargura = null;
            }
            atualizaLargura = window.setTimeout(function () {
                redimensionaColunaDados(indice, largura, larColLado);
            }, 25);
        }
    };
    this.setLinhaSelecionada = function (indice, valor) {
        if (isNaN(indice)) throw "JSDialogEdit.Tabela: InvalidArgumentException";
        if (typeof valor !== "boolean") throw "JSDialogEdit.Tabela: InvalidArgumentException";
        
        if (indice >= 0 && indice < linhas.length) {
            linhas[indice].setSelecionado(valor);
            alternaSelecaoElemento(linhas[indice], valor);
        
            if (valor) {
                linhasSelecionadas.push(indice);
            } else {
                for(var i = 0; i < linhasSelecionadas.length; i++) {
                    if(linhasSelecionadas[i] == indice) {
                        linhasSelecionadas.splice(i, 1);
                        break;
                    }
                }
            }
            
            onchangerowselected.call(this, linhas[indice]);
        } else {
            throw "JSDialogEdit.Tabela: IndexOutOfRangeException";
        }
    };
    /**
     * @function {Array<JSDialogEdit.Tabela.Linha>} getLinhasSelecionadas
     * Retorna um array com as linhas selecionadas
     * @return Array de linhas selecionadas
     */
    this.getLinhasSelecionadas = function () {
        var retorno = [];
        for(var x = 0; x < linhasSelecionadas.length; x++) retorno.push(linhas[linhasSelecionadas[x]]);
        return retorno;
    };
    this.getRegistros = function () {return registros;};
    this.getLinhas = function () {return linhas;};
    this.getRedimensiona = function () {return podeRedimensionar;};
    this.setRedimensiona = function (v) {if (typeof v === "boolean") podeRedimensionar = v;};
    this.getMoverColunas = function () {return moverColunas;};
    this.setMoverColunas = function (v) {if (typeof v === "boolean") moverColunas = v;};
    this.getOnChangeRowSelected = function () {return onchangerowselectedSrc;};
    this.setOnChangeRowSelected = function (f) {onchangerowselectedSrc = f;};
    this.setOnChangeRowSelectedFunction = function (f) {onchangerowselected = f;};
    this.getOnDataBound = function () {return ondataboundSrc;};
    this.setOnDataBound = function (f) {ondataboundSrc = f;};
    this.setOnDataBoundFunction = function (f) {ondatabound = f;};
    this.getOnBeforeMove = function () {return onbeforemoveSrc;};
    this.setOnBeforeMove = function (f) {onbeforemoveSrc = f;};
    this.setOnBeforeMoveFunction = function (f) {onbeforemove = f;};
    this.getOnAfterMove = function () {return onaftermoveSrc;};
    this.setOnAfterMove = function (f) {onaftermoveSrc = f;};
    this.setOnAfterMoveFunction = function (f) {onaftermove = f;};
    this.editaLinha = function (index) {
        oneditrow.call(this, linhas[index]);
    };
    this.getOnEditRow = function () {return oneditrowSrc;};
    this.setOnEditRow = function (f) {oneditrowSrc = f;};
    this.setOnEditRowFunction = function (f) {oneditrow = f;};
    this.repaint = function () {
        redimensionaDados();
    };
    this.getLayout = function () {return layout;};
    this.setLayout = function (v) {
        var elemento = this.getElemento();
        layout = v;
        
        divInterno.style.width = "100%";
        tabelaInterna.style.width = "100%";
        
        switch(v) {
            case JSDialogEdit.Conteiner.TiposLayout.SUPERIOR:
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "0px";
                elemento.style.left = "0px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.INFERIOR:
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "";
                elemento.style.left = "0px";
                elemento.style.bottom = "0px";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.CENTRO:
                elemento.style.MozBoxSizing = "border-box";
                elemento.style.WebkitBoxSizing = "border-box";
                elemento.style.boxSizing = "border-box";
                elemento.style.top = "0px";
                elemento.style.left = "0px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = "100%";
                elemento.style.height = "100%";
                self.getPropriedade("Largura").habilitado = false;
                self.getPropriedade("Altura").habilitado = false;
                self.getPropriedade("Superior").habilitado = false;
                self.getPropriedade("Esquerda").habilitado = false;
                break;
            case JSDialogEdit.Conteiner.TiposLayout.DIREITA:
                // TODO: :(
                break;
            case JSDialogEdit.Conteiner.TiposLayout.ESQUERDA:
                // TODO: :(
                break;
            case JSDialogEdit.Conteiner.TiposLayout.NONE:
            default:
                elemento.style.MozBoxSizing = "";
                elemento.style.WebkitBoxSizing = "";
                elemento.style.boxSizing = "";
                elemento.style.top = this.getSuperior() + "px";
                elemento.style.left = this.getEsquerda() + "px";
                elemento.style.bottom = "";
                elemento.style.right = "";
                elemento.style.width = this.getLargura() + "px";
                elemento.style.height = this.getAltura() + "px";
                self.getPropriedade("Largura").habilitado = true;
                self.getPropriedade("Altura").habilitado = true;
                self.getPropriedade("Superior").habilitado = true;
                self.getPropriedade("Esquerda").habilitado = true;
                divInterno.style.width = (this.getLargura() - 2) + "px";
                tabelaInterna.style.width = (this.getLargura() - JSDialogEdit.scrollWidth - 2) + "px";
                break;
        }
        
        redimensionar();
    };
    /**
     * @function {void} filtrar
     * Filtra as linhas da Tabela que nao atendam ao criterio especificado pela funcao fornecida
     * @param {function} f Funcao a ser usada como filtro.
     * A fun&ccedil;&atilde;o receber&aacute; cada um dos registros para ser verificado e deve retornar um valor boleano
     * indicando se o registro atende ou n&atilde;o ao filtro. Registros que n&atilde;o atenderem ao filtro
     * ser&atilde;o ocultadados. Se for passado o valor <i>null</i>, o filtro aplicado anteriormente sera removido.
     */
    this.filtrar = function (f) {
        if(typeof f !== "function" && f !== null) throw "JSDialogEdit.Tabela: InvalidArgumentException";
        if(filtro === null && f === null) return;
        
        if(timeoutFiltro !== null) window.clearTimeout(timeoutFiltro);
        filtro = f;
        posFiltro = 0;
        ultimoFiltro = linhas.length;
        exibeRegistroCallback = null;
        divAvisos.className = divAvisos.className.replace(" jsdeTabelaLoading", "");
        divAvisos.className += " jsdeTabelaLoading";
        divAvisos.textContent = "Filtrando dados...";
        timeoutFiltro = window.setTimeout(aplicarFiltro, 10);
    };
    
    var redimensionaColunaDados = function (indice, largura, larColLado) {
        var l = largura - gradeRedutor;
        var lCL = larColLado - gradeRedutor;
        
        larguraDados[indice] = l;
        larguraDados[indice + 1] = lCL;
        
        for(var i = 0;i < tabelaInterna.rows.length;i++) {
            if (atualizaLargura === null) break;
            tabelaInterna.rows[i].cells[indice].firstChild.style.width = l + "px";
            tabelaInterna.rows[i].cells[indice + 1].firstChild.style.width = lCL + "px";
        }
    };
    var alternaSelecaoElemento = function (linha, situacao) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getTipo() === JSDialogEdit.Tabela.Coluna.Tipos.SELECAO) {
                linha.getElemento().cells[x].firstChild.firstChild.checked = situacao;
            }
        }
    };
    var redimensionar = function () {
        var altura = self.getAltura();
        var celula;
        if (self.getCabecalho() && cabecalho.rows[0].cells.length > 0) altura -= (cabecalho.clientHeight !== 0 ? cabecalho.clientHeight : 25);
        if (self.getRodape() && rodape.rows[0].cells.length > 0) altura -= (rodape.clientHeight !== 0 ? rodape.clientHeight : 20);
        divInterno.style.height = altura + "px";
        if (tabelaInterna.rows.length > 0) {
            celula = tabelaInterna.rows[0].cells[tabelaInterna.rows[0].cells.length - 1];
            celula.style.width = (parseInt(celula.style.width, 10) - JSDialogEdit.scrollWidth) + "px";
        }
    };
    var limpaGrid = function () {
        var x, autoColunas;
        while(tabelaInterna.rows.length > 0) tabelaInterna.deleteRow(-1);
        for(x = 0; x < filhos.length; x++) {
            if (filhos[x].getAutoVinculo()) {
                self.removeFilho(filhos[x]);
                x--;
            }
        }
        if (autoVincular) {
            autoColunas = self.getObjetoConector().getCampos();
            for(x = 0; x < autoColunas.length; x++) {
                var coluna = new JSDialogEdit.Tabela.Coluna({
                    "ID"     : self.getId() + "_" + autoColunas[x].getId(),
                    "Campo"  : autoColunas[x].getId(),
                    "Titulo" : autoColunas[x].getId()
                });
                coluna.setAutoVinculo(true);
                self.addFilho(coluna);
            }
        }
    };
    var populaGrid = function () {
        tempoCargaTotal = new Date().getTime();
        carregaLarguraColunas();
        linhas = [];
        linhaRegistro = 0;
        timeout = window.setTimeout(exibeRegistro, 10);
        tabelaInterna.style.display = "block";
        divAvisos.className = divAvisos.className.replace(" jsdeTabelaLoading", "");
        divAvisos.className += " jsdeTabelaLoading";
        divAvisos.textContent = "Carregando dados...";
    };
    var exibeRegistro = function () {
        var c, linha, coluna, inicio, tempo;
        
        inicio = new Date().getTime();
        
        if(linhaRegistro >= registros.length || linhaRegistro >= maxRegistros) {
            tempoCargaTotal = new Date().getTime() - tempoCargaTotal;
            timeout = null;
            if(exibeRegistroCallback) {
                window.setTimeout(exibeRegistroCallback, 10);
                exibeRegistroCallback = null;
            } else {
                divAvisos.className = divAvisos.className.replace(" jsdeTabelaLoading", "");
            }
            
            return;
        }
        
        linha = tabelaInterna.insertRow(-1);
        linha.id = self.getId() + "_Registro_" + linhaRegistro;
        linha.className = tabelaInterna.rows.length % 2 === 0 ? "jsdeTabelaLinhaColorida" : "jsdeTabelaLinha";
        linha.ondblclick = function (e) {
            self.editaLinha(this.rowIndex);
        };
        linhas.push(new JSDialogEdit.Tabela.Linha({
            "indice"      : linhaRegistro,
            "registro"    : registros[linhaRegistro],
            "chave"       : campoChave !== "" ? registros[linhaRegistro][campoChave] : null,
            "selecionado" : false,
            "elemento"    : linha,
            "filtrado"    : filtro === null ? false : !filtro(registros[linhaRegistro])
        }));
        
        for(c = 0; c < filhos.length; c++) {
            coluna = linha.insertCell(-1);
            var campo = filhos[c].getCampo();
            var valor = campo !== "" ? registros[linhaRegistro][campo] : "";
            var tipoDado = campo === "" ? filhos[c].getTipo() : self.getObjetoConector().getCampo(campo).getTipo();
            var conteudo = null;
            var conteiner = document.createElement("div");
            conteiner.className = "jsdeTabelaCelula";
            conteiner.title = valor;
            conteiner.style.width = larguraDados[c] + "px";
            
            switch(tipoDado) {
                case JSDialogEdit.Tabela.Coluna.Tipos.SELECAO:
                    conteiner.className += " jsdeTabelaCelulaSelecao jsdeTabelaCelulaBoolean";
                    if(filhos[c].getSelecaoImagem()) {
                        conteudo = document.createElement("img");
                        conteudo.src = filhos[c].getSelecaoImagem();
                        conteudo.title = filhos[c].getSelecaoTexto() || "Selecionar";
                        conteudo.checked = false;
                        conteudo.onclick = function (e) {
                            this.checked = !this.checked;
                            self.setLinhaSelecionada(this.value, this.checked);
                        };
                    } else if(filhos[c].getSelecaoTexto()) {
                        conteudo = document.createElement("label");
                        conteudo.innerHTML = filhos[c].getSelecaoTexto();
                        conteudo.checked = false;
                        conteudo.onclick = function (e) {
                            this.checked = !this.checked;
                            self.setLinhaSelecionada(this.value, this.checked);
                        };
                    } else {
                        conteudo = document.createElement("input");
                        conteudo.type = "checkbox";
                        conteudo.onclick = function (e) {
                            self.setLinhaSelecionada(this.value, this.checked);
                        };
                    }
                    
                    conteudo.name = filhos[c].getId();
                    conteudo.value = linhaRegistro;
                    conteudo.className = "jsdeTabelaCampoSelecao";
                    break;
                case JSDialogEdit.Tabela.Coluna.Tipos.BOOLEAN:
                    conteiner.className += " jsdeTabelaCelulaBoolean";
                    conteudo = document.createElement("div");
                    conteudo.className = valor === true ? "jsdeTabelaCheckboxOn" : "jsdeTabelaCheckboxOff";
                    break;
                case JSDialogEdit.Tabela.Coluna.Tipos.NUMBER:
                    conteiner.className += " jsdeTabelaCelulaNumber";
                    conteudo = document.createElement("label");
                    conteudo.innerHTML = valor;
                    break;
                case JSDialogEdit.Tabela.Coluna.Tipos.DATETIME:
                    conteiner.className += " jsdeTabelaCelulaDateTime";
                    conteudo = document.createElement("label");
                    conteudo.innerHTML = valor;
                    break;
                case JSDialogEdit.Tabela.Coluna.Tipos.UNIXTIME:
                    conteiner.className += " jsdeTabelaCelulaDateTime";
                    conteudo = document.createElement("label");
                    conteudo.innerHTML = new Date(valor);
                    break;
                case JSDialogEdit.Tabela.Coluna.Tipos.STRING:
                default:
                    conteiner.className += " jsdeTabelaCelulaString";
                    conteudo = document.createElement("label");
                    conteudo.innerHTML = valor;
                    break;
            }
            
            conteiner.appendChild(conteudo);
            coluna.appendChild(conteiner);
            
            if(
                tipoDado !== JSDialogEdit.Tabela.Coluna.Tipos.SELECAO &&
                tipoDado !== JSDialogEdit.Tabela.Coluna.Tipos.BOOLEAN &&
                filhos[c].getMaxWidth() < conteudo.offsetWidth + gradeRedutor
            ) {
                filhos[c].setMaxWidth(conteudo.offsetWidth + gradeRedutor);
            }
        }
        
        ondatabound.call(this, linhas[linhas.length - 1]);
        linhaRegistro++;
        
        tempo = new Date().getTime() - inicio;
        if(tempo > limiteTimeout) {
            timeout = window.setTimeout(exibeRegistro, tempo + limiteTimeout);
        } else {
            timeout = window.setTimeout(exibeRegistro, limiteTimeout);
        }
    };
    var carregaLarguraColunas = function () {
        var c, largura, atualiza = false;
        
        if(filhos.length === 0) return false;
        
        if(larguraDados.length != filhos.length) {
            larguraDados.length = filhos.length;
            atualiza = true;
        }
        
        for(c = 0; c < filhos.length - 1; c++) {
            largura = filhos[c].getLargura() - gradeRedutor;
            if(largura != larguraDados[c]) {
                larguraDados[c] = largura;
                atualiza = true;
            }
        }
        
        largura = filhos[filhos.length - 1].getLargura() - gradeRedutor - JSDialogEdit.scrollWidth;
        if(largura != larguraDados[filhos.length - 1]) {
            larguraDados[filhos.length - 1] = largura;
            atualiza = true;
        }
        
        return atualiza;
    };
    var redimensionaDados = function () {
        var l, c, celula, div, conteiner;
        if(carregaLarguraColunas()) {
            for(l = 0; l < tabelaInterna.rows.length; l++) {
                for(c = 0; c < filhos.length; c++) {
                    celula = tabelaInterna.rows[l].cells[c];
                    conteiner = celula.firstChild;
                    div = celula.firstChild.lastChild;
                    conteiner.style.width = larguraDados[c] + "px";
                }
            }
        }
    };
    var atualizaRegistro = function (indice) {
        //TODO atualizar registro
    };
    var moverColuna = function (e) {
        var dx, left, right, pos, centro, i;
        e = e || event;
        
        if (!moverColunas || !self.dragColuna || filhos.length == 1 || self.getMode() === "edicao") return;
        try { if (onbeforemove.call(this, e, self.dragColuna.coluna) === false) return; } catch(ex) {}
        
        if (!dragging) {
            if (!dragX) dragX = e.clientX;
            dx = e.clientX - dragX;
            if (dx >= 3 || dx <= -3) {
                dragDiv = self.dragColuna.coluna.getElemento();
                self.dragColuna.placeholder.style.position = "absolute";
                self.dragColuna.placeholder.style.opacity = 0.8;
                self.dragColuna.placeholder.style.left = dragDiv.offsetLeft + "px";
                dragDiv.style.opacity = 0.01;
                cabecalho.rows[0].appendChild(self.dragColuna.placeholder);
                dragX = e.clientX;
                maxDragX = cabecalho.rows[0].clientWidth - self.dragColuna.placeholder.clientWidth - 2;
                dragging = true;
                JSDialogEdit.Core.capturaEvento(window, "mouseup", fimMoverColuna);
                movendoUltimaColuna = self.dragColuna.coluna == filhos[filhos.length - 1];
            }
        } else {
            left = parseInt(self.dragColuna.placeholder.style.left, 10) + e.clientX - dragX;
            if (left > maxDragX) {
                left = maxDragX;
            } else if (left < 0) {
                left = 0;
            } else {
                dragX = e.clientX;
            }
            self.dragColuna.placeholder.style.left = left + "px";
            right = left + self.dragColuna.placeholder.clientWidth;
            
            pos = cabecalho.rows[0].children.length;
            for(i = 0; i < cabecalho.rows[0].children.length - 1; i++) {
                if (cabecalho.rows[0].children[i] == dragDiv) {
                    pos = i;
                    continue;
                }
                
                centro = cabecalho.rows[0].children[i].clientWidth / 2 + cabecalho.rows[0].children[i].offsetLeft;
                if (i < pos && left < centro) {
                    cabecalho.rows[0].insertBefore(dragDiv, cabecalho.rows[0].children[i]);
                    if (right < centro) break;
                }
                
                if (i > pos && right > centro) {
                    if (i == cabecalho.rows[0].children.length - 2) {
                        cabecalho.rows[0].insertBefore(dragDiv, cabecalho.rows[0].lastChild);
                    } else {
                        cabecalho.rows[0].insertBefore(dragDiv, cabecalho.rows[0].children[i].nextSibling);
                    }
                    break;
                }
            }
        
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
        }
    };
    var fimMoverColuna = function (e) {
        var x, i, l, tmp, larg1, larg2, lateral, ultimo = false;
        
        try {
            JSDialogEdit.Core.removeEvento(window, "mouseup", fimMoverColuna);
            dragDiv.style.opacity = "";
            cabecalho.rows[0].removeChild(self.dragColuna.placeholder);
            dragging = false;
            dragX = null;
            
            for(x = 0; x < cabecalho.rows[0].children.length; x++) {
                if (cabecalho.rows[0].cells[x] != filhos[x].getElemento()) {
                    for(i = x + 1; i < filhos.length; i++) {
                        tmp = filhos[i];
                        filhos[i] = filhos[x];
                        filhos[x] = tmp;
                        if (registros !== null) {
                            for(l = 0; l < tabelaInterna.rows.length; l++) {
                                tmp = tabelaInterna.rows[l].cells[x];
                                lateral = tabelaInterna.rows[l].cells[i].nextSibling;
                                tabelaInterna.rows[l].insertBefore(tabelaInterna.rows[l].cells[i], tmp);
                                tabelaInterna.rows[l].insertBefore(tmp, lateral);
                                ultimo = lateral === null;
                            }
                        }
                        
                        if (cabecalho.rows[0].cells[x] == filhos[x].getElemento()) {
                            break;
                        }
                    }
                }
            }
            
            if (ultimo) {
                //self.setLagurgaColuna(filhos[filhos.length - 1], filhos[filhos.length - 1].getLargura());
                larg1 = filhos[filhos.length - 1].getLargura() - JSDialogEdit.scrollWidth;
                larg2 = filhos[filhos.length - 2].getLargura();
                atualizaLargura = true;
                redimensionaColunaDados(filhos.length - 1, larg1, larg2);
                atualizaLargura = null;
            }
            
            if (movendoUltimaColuna) {
                if (self.dragColuna.coluna == filhos[0]) {
                    self.setLagurgaColuna(filhos[1], filhos[1].getLargura());
                } else {
                    self.setLagurgaColuna(self.dragColuna.coluna, self.dragColuna.coluna.getLargura());
                }
            }
            
            try { onaftermove.call(this, e, self.dragColuna.coluna); } catch(ex) {}

            self.dragColuna = null;
            dragDiv = null;
        } catch(ex) {
            if (fimMoverColuna) JSDialogEdit.Core.removeEvento(window, "mouseup", fimMoverColuna);
            if (cabecalho.rows[0].lastChild.id.indexOf("cloneDragColuna") != -1) cabecalho.rows[0].removeChild(cabecalho.rows[0].lastChild);
            for(x = 0; x < cabecalho.rows[0].cells.length; x++) cabecalho.rows[0].cells[x].style.opacity = "";
            dragging = false;
            dragX = null;
        }
    };
    var carregaMaisRegistros = function (e) {
        if(linhas.length == registros.length) return;
        
        var scroll = divInterno.scrollHeight - divInterno.scrollTop;
        var alturaLinha = linhas[0].getElemento().clientHeight;
        var qtdeLinhasPagina = parseInt(divInterno.clientHeight / alturaLinha, 10);
        var limite = qtdeLinhasPagina * alturaLinha * 3;
        
        if(scroll <= limite) {
            maxRegistros += 100;
            tempoCargaTotal = new Date().getTime();
            timeout = window.setTimeout(exibeRegistro, 10);
            divAvisos.className = divAvisos.className.replace(" jsdeTabelaLoading", "");
            divAvisos.className += " jsdeTabelaLoading";
        }
    };
    var aplicarFiltro = function () {
        var inicio = new Date().getTime();
        linhas[posFiltro].filtrar(filtro);
        var tempo = new Date().getTime() - inicio;
        
        posFiltro++;
        
        if(posFiltro < ultimoFiltro) {
            if(tempo > limiteTimeout) {
                timeoutFiltro = window.setTimeout(aplicarFiltro, tempo + limiteTimeout);
            } else {
                timeoutFiltro = window.setTimeout(aplicarFiltro, limiteTimeout);
            }
        } else {
            timeoutFiltro = null;
            testaAplicarMaisFiltros();
        }
    };
    var testaAplicarMaisFiltros = function () {
        if(timeout === null && linhas.length < registros.length && tabelaInterna.clientHeight < divInterno.clientHeight) {
            maxRegistros += 100;
            exibeRegistroCallback = testaAplicarMaisFiltros;
            tempoCargaTotal = new Date().getTime();
            timeout = window.setTimeout(exibeRegistro, 10);
        } else {
            divAvisos.className = divAvisos.className.replace(" jsdeTabelaLoading", "");
        }
    };
    var init = function () {
        var tabela = self.getElemento();
        
        divAvisos = document.createElement("div");
        divAvisos.className = "jsdeTabelaAvisos";
        
        tabelaInterna = document.createElement("table");
        tabelaInterna.cellPadding = "0";
        tabelaInterna.cellSpacing = "0";
        tabelaInterna.className = "jsdeTabelaInterna";
        tabelaInterna.style.display = "none";
        
        divInterno = document.createElement("div");
        divInterno.className = "jsdeTabelaDivInterno";
        divInterno.appendChild(divAvisos);
        divInterno.appendChild(tabelaInterna);
        divInterno.onscroll = carregaMaisRegistros;
        
        cabecalho = tabela.createTHead();
        cabecalho.insertRow(-1);
        
        rodape = tabela.createTFoot();
        rodape.style.display = "none";
        rodape.insertRow(-1);
        
        corpo = document.createElement("tbody");
        corpo.insertRow(-1);
        corpo.rows[0].insertCell(-1);
        corpo.rows[0].cells[0].style.verticalAlign = "top";
        corpo.rows[0].cells[0].appendChild(divInterno);
        self.appendHTMLChild(corpo);
        
        tabela.className = "jsdeTabela";
        tabela.cellPadding = "0";
        tabela.cellSpacing = "0";
        
        JSDialogEdit.Core.capturaEvento(tabela, "mousemove", moverColuna);
        
        if (!propriedades || !propriedades.Altura) self.setAltura(150);
        if (!propriedades || !propriedades.Largura) self.setLargura(150);
        
        self.getPropriedade("Valor").habilitado = false;
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        self.getPropriedade("Classe").habilitado = false;
        self.getPropriedade("Estilos").habilitado = false;
        self.getPropriedade("TabIndex").habilitado = false;
        self.getPropriedade("Desabilitado").habilitado = false;
        self.getPropriedade("Tooltip").habilitado = false;
        self.getPropriedade("Campo").habilitado = false;
        self.getPropriedade("Conector").refresh = true;
        self.getEvento("OnFocus").habilitado = false;
        self.getEvento("OnBlur").habilitado = false;
        self.getEvento("OnMouseOver").habilitado = false;
        self.getEvento("OnMouseOut").habilitado = false;
        self.getEvento("OnMouseDown").habilitado = false;
        self.getEvento("OnMouseUp").habilitado = false;
        self.getEvento("OnMouseMove").habilitado = false;
        self.getEvento("OnClick").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "CampoChave",
            "descricao" : "Define um campo do Conector como Chave Primaria do registro",
            "tipo" : JSDialogEdit.Propriedade.Tipos.ListaFuncao,
            "get" : "getCampoChave",
            "set" : "setCampoChave",
            "funcao" : "retornaListaCampos",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Grade",
            "descricao" : "Define se sera exibida as linhas de grade da Tabela",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getGrade",
            "set" : "setGrade",
            "opcoes" : JSDialogEdit.Tabela.Grade,
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Cabecalho",
            "descricao" : "Define se o titulo das colunas estarao visiveis ou nao",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getCabecalho",
            "set" : "setCabecalho",
            "habilitado" : false
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Rodape",
            "descricao" : "Define se o rodape das colunas estarao visiveis ou nao",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getRodape",
            "set" : "setRodape",
            "habilitado" : false
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "AutoVincular",
            "descricao" : "Define se a Tabela carregará todos os campos do Conector relacionado ou so exibirá as Colunas incluidas na edição",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getAutoVincular",
            "set" : "setAutoVincular",
            "habilitado" : true,
            "refresh" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Redimensiona",
            "descricao" : "Define se as colunas da Tabela podem ser redimensionadas",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getRedimensiona",
            "set" : "setRedimensiona",
            "habilitado" : true,
            "refresh" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "MoverColunas",
            "descricao" : "Permite aos usuarios reordernar as colunas",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getMoverColunas",
            "set" : "setMoverColunas",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "NovaColuna",
            "descricao" : "Inclui uma nova coluna",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Acao,
            "funcao" : "novaColuna",
            "habilitado" : true,
            "refresh" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Layout",
            "descricao" : "Layout do Componente",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getLayout",
            "set" : "setLayout",
            "habilitado" : false,
            "opcoes" : JSDialogEdit.Conteiner.TiposLayout
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnDataBound",
            "descricao" : "Evento disparado para cada linha processada",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnDataBound",
            "set" : "setOnDataBound",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : "JSDialogEdit.Tabela.Linha row"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnChangeRowSelected",
            "descricao" : "Evento disparado quando um Registro for selecionado",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnChangeRowSelected",
            "set" : "setOnChangeRowSelected",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : "JSDialogEdit.Tabela.Linha row"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnBeforeMove",
            "descricao" : "Evento disparado antes de uma Colunas for movida",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnBeforeMove",
            "set" : "setOnBeforeMove",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e, JSDialogEdit.Tabela.Coluna coluna"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnAfterMove",
            "descricao" : "Evento disparado apos uma Coluna ser movida",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnAfterMove",
            "set" : "setOnAfterMove",
            "habilitado" : true,
            "retorno" : "boolean",
            "parametros" : "Event e, JSDialogEdit.Tabela.Coluna coluna"
        }));
        self.addEvento(new JSDialogEdit.Propriedade({
            "nome" : "OnEditRow",
            "descricao" : "Evento disparado quando uma linha for editada",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Funcao,
            "get" : "getOnEditRow",
            "set" : "setOnEditRow",
            "habilitado" : true,
            "retorno" : "void",
            "parametros" : "JSDialogEdit.Tabela.Linha row"
        }));
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Tabela, JSDialogEdit.Componente);

JSDialogEdit.Tabela.Linha = function () {
    var indice      = arguments[0].indice;
    var registro    = arguments[0].registro;
    var chave       = arguments[0].chave;
    var selecionado = arguments[0].selecionado;
    var elemento    = arguments[0].elemento;
    var filtrado    = arguments[0].filtrado;
    
    if(filtrado === true) elemento.className += " jsdeTabelaLinhaFiltrada";
    
    this.getIndice = function () {return indice;};
    this.getRegistro = function () {return registro;};
    this.getChave = function () {return chave;};
    this.getElemento = function () {return elemento;};
    this.isFiltrado = function () {return filtrado;};
    this.filtrar = function (f) {
        if(typeof f !== "function" && f !== null) throw "JSDialogEdit.Tabela.Linha: InvalidArgumentException";
        
        filtrado = f === null ? false : !f(registro);
        elemento.className = elemento.className.replace(" jsdeTabelaLinhaFiltrada", "");
        if(filtrado) {
            if(f === null) throw "JSDialogEdit.Tabela.Linha: InternalError - " + registro + f;
            elemento.className += " jsdeTabelaLinhaFiltrada";
            this.setSelecionado(false);
        } else {
            elemento.className = elemento.className.replace(" jsdeTabelaLinhaFiltrada", "");
        }
    };
    this.isSelecionado = function () {return selecionado;};
    this.setSelecionado = function (valor) {
        if(typeof valor !== "boolean") throw "JSDialogEdit.Tabela.Linha: InvalidArgumentException";
        
        selecionado = valor;
        if(valor) {
            elemento.className += " jsdeTabelaLinhaSelecionada";
        } else {
            elemento.className = elemento.className.replace(" jsdeTabelaLinhaSelecionada", "");
        }
    };
};

/**
 * @class {class} JSDialogEdit.Tabela.Coluna
 * Classe representando uma Coluna de uma Tabela (Grid) com todos os seus atributos
 * @constructor JSDialogEdit.Tabela.Coluna Cria um novo objeto
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente
 */
JSDialogEdit.Tabela.Coluna = function () {
    JSDialogEdit.Objeto.call(this);
    
    var self = this,
        propriedades = arguments[0] || null,
        elemento = null,
        conteiner = null,
        tipo = JSDialogEdit.Tabela.Coluna.Tipos.STRING,
        selecaoImagem = null,
        selecaoTexto = null,
        campo = "",
        conteudo = null,
        titulo = "",
        split = null,
        divTamanho = null,
        largura = 0,
        novaLargura = 0,
        larguraMininaColuna = 22,
        resizeColuna = false,
        autoVinculo = false,
        resizeX,
        placeholder = null,
        maxWidth = 0,
        setId = this.setId;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Tabela.Coluna";
    
    /**
     * @function {DOM.HTMLElement} getElemento
     * Retorna uma referencia ao objeto DOM.HTMLElement que renderiza o componente na p&aacute;gina.
     * @return Objeto HTML da p&aacute;gina
     */
    this.getElemento = function () {return elemento;};
    /**
     * @function {DOM.HTMLElement} getElementoDesign
     * Retorna uma referencia ao objeto DOM.HTMLElement que renderiza o componente durante a edi&cecedil;&atilde;o da janela.
     * @return Objeto HTML em tempo de design
     */
    this.getElementoDesign = function () {return elemento;};
    /**
     * @function {JSDialogEdit.Conteiner} getConteiner
     * Retorna o objeto {@link JSDialogEdit.Conteiner} em que o Componente esta localizado
     * @return Conteiner que o Componente foi inserido
     */
    this.getConteiner  = function () {return conteiner;};
    /**
     * @function {void} setConteiner
     * Define o objeto {@link JSDialogEdit.Conteiner} no qual o Componente ser&aacute; inserido
     * @param {JSDialogEdit.Conteiner} c Conteiner onde o Componente ser&aacute; inserido
     */
    this.setConteiner  = function (v)  {conteiner = v;};
    /**
     * @function {void} setId
     * Define o valor do IDentificador do componente e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function (v) {
        setId.call(this, v);
        if (v === "") return;
        elemento.id = v + "_header";
    };
    /**
     * @function {String} getTitulo
     * Retorna o texto exibido no cabecalho da coluna
     * @return Texto exibido
     */
    this.getTitulo = function () {return titulo;};
    /**
     * @function {void} setTitulo
     * Define o texto a ser exibido no cabecalho da coluna
     * @param {String} v Texto a ser exibido
     */
    this.setTitulo = function (v) {
        conteudo.innerHTML = titulo = v;
        largura = elemento.clientWidth;
    };
    /**
     * @function {int} getLargura
     * Retorna a largura da Coluna em pixel
     * @return Largura da coluna
     */
    this.getLargura = function ___jsdialogedit_tabela_coluna_getLargura()  {
        var l = elemento.offsetWidth;
        if (l === 0) return largura;
        return l;
    };
    /**
     * @function {void} setLargura
     * Define a largura da Coluna em pixel
     * @param {int} v Largura a ser difinida para a coluna
     */
    this.setLargura = function (v) {
        if (v === "auto") {
            elemento.style.width = v;
            conteudo.style.width = v;
            return;
        }
        
        if (isNaN(v)) return;
        
        v = parseInt(v, 10);
        largura = v;
        elemento.style.width = v + "px";
        conteudo.style.width = (v - 2) + "px"; // bordas do split
    };
    /**
     * @function {JSDialogEdit.Tabela.Coluna.Tipos} getTipo
     * Retorna o tipo de dado exibido pela coluna
     * @return Tipo de dado exibido
     */
    this.getTipo = function () {return tipo;};
    /**
     * @function {void} setTipo
     * Define o tipo de dado a ser exibido pela coluna, influencia na formata&cecedil;&atilde;o da coluna.
     * @param {JSDialogEdit.Tabela.Coluna.Tipos} v Tipo de dado exibido
     */
    this.setTipo = function (v) {
        if (campo !== "") return;
        switch(v) {
            case JSDialogEdit.Tabela.Coluna.Tipos.SELECAO:
                tipo = v;
                this.getPropriedade("SelecaoImagem").habilitado = true;
                this.getPropriedade("SelecaoTexto").habilitado = true;
                break;
            case JSDialogEdit.Tabela.Coluna.Tipos.STRING:
            case JSDialogEdit.Tabela.Coluna.Tipos.NUMBER:
            case JSDialogEdit.Tabela.Coluna.Tipos.BOOLEAN:
            case JSDialogEdit.Tabela.Coluna.Tipos.DATETIME:
            case JSDialogEdit.Tabela.Coluna.Tipos.UNIXTIME:
                tipo = v;
                this.getPropriedade("SelecaoImagem").habilitado = false;
                this.getPropriedade("SelecaoTexto").habilitado = false;
                break;
            default:
                return;
        }
    };
    /**
     * @function {String} getCampo
     * Retorna o nome do campo, referente ao componente de Conexao vinculado, sendo exibido pela coluna
     * @return Nome do campo sendo exibido
     */
    this.getCampo = function () {return campo;};
    /**
     * @function {void} setCampo
     * Define qual o campo, referente ao componente de Conexao vinculado, que deve ser exibido pela coluna
     * @param {String} v Nome do campo a ser exibido
     */
    this.setCampo = function (v) {
        this.getPropriedade("Tipo").habilitado = v === "";
        if (v !== "" && conteiner !== null && conteiner.getMode() === "edicao") this.setTitulo(v);
        campo = v;
    };
    /**
     * @function {JSONObject} getListaCampos
     * Retorna o nome do campo, referente ao componente de Conexao vinculado, sendo exibido pela coluna
     * Retorna uma estrutura com os nomes dos Campos do componente ConexaoXML vinculado
     * @return Estrutura com os nomes dos campos 
     */
    this.getListaCampos = function () {
        if(JSDialogEdit.trace === 2) JSDialogEdit.Core.trace();
        
        var obj = {};
        if (conteiner !== null) return conteiner.retornaListaCampos();
        return obj;
    };
    this.getAutoVinculo = function () {return autoVinculo;};
    this.setAutoVinculo = function (v) {if (typeof v === "boolean") autoVinculo = v;};
    /**
     * @function {String} getSelecaoImagem
     * Retorna o endereco da imagem que vai substituir o Checkbox padrao dos campos do tipo Selecao.
     * @return Caminho da imagem a ser exibida como selecao.
     */
    this.getSelecaoImagem = function () {return selecaoImagem;};
    /**
     * @function {void} setSelecaoImagem
     * Define uma imagem para substituir o checkbox padrao dos campos do tipo Selecao.
     * @param {String} url Caminho da imagem a ser exibida como selecao.
     */
    this.setSelecaoImagem = function (url) {selecaoImagem = url;};
    /**
     * @function {String} getSelecaoTexto
     * Retorna o texto que vai substituir o Checkbox padrao dos campos do tipo Selecao.
     * @return Texto exibido como selecao.
     */
    this.getSelecaoTexto = function () {return selecaoTexto;};
    /**
     * @function {void} setSelecaoTexto
     * Define o texto para substituir o Checkbox padrao dos campos do tipo Selecao.
     * @param {String} v Texto a ser exibida como selecao.
     */
    this.setSelecaoTexto = function (v) {selecaoTexto = v;};
    this.getMaxWidth = function () {return maxWidth;};
    this.setMaxWidth = function (v) {
        if(typeof v !== "number") return;
        if(v < larguraMininaColuna) v = larguraMininaColuna;
        
        maxWidth = v;
    };
    
    var startRedimColuna = function (e) {
        e = e || event;
        split.style.cursor = "";
        
        if (conteiner.getMode() === "execucao" && !conteiner.getRedimensiona()) {
            split.style.cursor = "default";
            return;
        }
        
        resizeColuna = true;
        resizeX = e.clientX;
        novaLargura = self.getLargura();
        divTamanho.innerHTML = novaLargura + "px";
        elemento.appendChild(divTamanho);
        JSDialogEdit.Core.capturaEvento(window, "mousemove", runRedimColuna);
        JSDialogEdit.Core.capturaEvento(window, "mouseup", endRedimColuna);
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    };
    var runRedimColuna = function (e) {
        var dx;
        if (!resizeColuna) return;

        e = e || event;
        dx = e.clientX - resizeX;
        novaLargura = novaLargura + dx;
        divTamanho.innerHTML = novaLargura + "px";
        resizeX = e.clientX;
        conteiner.setLagurgaColuna(self, novaLargura);
    };
    var endRedimColuna = function (e) {
        resizeColuna = false;
        divTamanho.innerHTML = "";
        elemento.removeChild(divTamanho);
        JSDialogEdit.Core.removeEvento(window, "mousemove", runRedimColuna);
        JSDialogEdit.Core.removeEvento(window, "mouseup", endRedimColuna);
    };
    var autoRedimColuna = function (e) {
        if(maxWidth === 0) {
            maxWidth = JSDialogEdit.Core.larguraTexto(conteudo) + 2;
            if(maxWidth < larguraMininaColuna) maxWidth = larguraMininaColuna;
        }
        
        novaLargura = maxWidth;
        divTamanho.innerHTML = novaLargura + "px";
        conteiner.setLagurgaColuna(self, novaLargura);
    };
    var init = function () {
        elemento = document.createElement("th");
        elemento.scope = "col";
        
        split = document.createElement("div");
        split.className = "jsdeTabelaSplit";
        split.onmousedown = startRedimColuna;
        split.onmouseup = endRedimColuna;
        split.ondblclick = autoRedimColuna;
        
        conteudo = document.createElement("div");
        conteudo.className = "jsdeTabelaCabecalho";
        
        elemento.appendChild(split);
        elemento.appendChild(conteudo);
        
        divTamanho = document.createElement("div");
        divTamanho.className = "jsdeTooltip";
        divTamanho.style.top = "-20px";
        divTamanho.style.left = "-20px";
        
        JSDialogEdit.Core.capturaEvento(elemento, "mousedown", function (e) {
            placeholder = document.createElement("table");
            placeholder.appendChild(elemento.cloneNode(true));
            placeholder.id = "cloneDragColuna_" + self.getId();
            placeholder.style.width = elemento.clientWidth + "px";
            if (conteiner) {
                conteiner.dragColuna = {
                    "coluna" : self,
                    "placeholder" : placeholder
                };
            }
        });
        JSDialogEdit.Core.capturaEvento(elemento, "mouseup", function (e) {
            placeholder = null;
            if (conteiner) conteiner.dragColuna = null;
        });
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Titulo",
            "descricao" : "Define o titulo da coluna",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getTitulo",
            "set" : "setTitulo",
            habilitado : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Tipo",
            "descricao" : "Define o tipo de dados da coluna",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getTipo",
            "set" : "setTipo",
            "habilitado" : true,
            opcoes : JSDialogEdit.Tabela.Coluna.Tipos
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "SelecaoImagem",
            "descricao" : "Imagem a ser usada como selecao",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getSelecaoImagem",
            "set" : "setSelecaoImagem",
            "habilitado" : false
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "SelecaoTexto",
            "descricao" : "Texto a ser usado como selecao",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getSelecaoTexto",
            "set" : "setSelecaoTexto",
            "habilitado" : false
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Largura",
            "descricao" : "Define a largura da coluna",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Numero,
            "get" : "getLargura",
            "set" : "setLargura",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Campo",
            "descricao" : "Indica de qual campo do componente ConexaoXML vir\u00E1 os dados",
            "tipo" : JSDialogEdit.Propriedade.Tipos.ListaFuncao,
            "get" : "getCampo",
            "set" : "setCampo",
            "funcao" : "getListaCampos",
            "habilitado" : true
        }));
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Tabela.Coluna, JSDialogEdit.Objeto);

/**
 * @struct {static final JSONObject} JSDialogEdit.Tabela.Coluna.Tipos Lista est&aacute;tica com os tipos de dados que uma coluna pode conter
 * <il><b>SELECAO</b> Permite ao usu&aacute;rio selecionar a linha
 * <il><b>STRING</b> Coluna com conteudo alfanumerico
 * <il><b>NUMBER</b> Coluna contendo numero inteiro ou decimal
 * <il><b>BOOLEAN</b> Coluna logico podendo ter o valor representado como "true"/"false" ou 1/0
 * <il><b>DATETIME</b> Coluna contendo uma data
 * <il><b>UNIXTIME</b> Coluna contendo uma data
*/
JSDialogEdit.Tabela.Coluna.Tipos = {
    "SELECAO" : "selecao",
    "STRING" : "string",
    "NUMBER" : "number",
    "BOOLEAN" : "boolean",
    "DATETIME" : "datetime",
    "UNIXTIME" : "unixtime"
};

/**
 * @struct {static final JSONObject} JSDialogEdit.Tabela.Grade Lista est&aacute;tica com os tipos de grades que uma tabela pode exibir
 * <il><b>NENHUMA</b> N&atilde;o exibe grade na tabela
 * <il><b>VERTICAL</b> Grade somente entre as colunas
 * <il><b>HORIZONTAL</b> Grade somente entre as linhas
 * <il><b>AMBOS</b> Grade somente em toda a tabela
*/
JSDialogEdit.Tabela.Grade = {"NENHUMA" : 0, "VERTICAL" : 1, "HORIZONTAL" : 2, "AMBOS" : 3};

/**
 * @class {class} JSDialogEdit.Frame
 * Classe representando um Frame com todos os seus atributos
 * @constructor JSDialogEdit.Frame Cria um novo objeto
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente
 */
JSDialogEdit.Frame = function () {
    JSDialogEdit.Componente.call(this, "iframe"); //, arguments[0]);
    var self = this,
        propriedades = arguments[0] || null,
        url = "",
        borda = true,
        barraRolagem = "auto";
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Frame";
    
    /**
     * @function {String} getUrl
     * Retorna a URL a ser carregada pelo Frame
     * @return Valor da URL
     */
    this.getUrl = function (){return url;};
    /**
     * @function {void} setUrl
     * Define o valor para um dos parametros enviados na requisi&ccedil;&atilde;o do XML/JSON
     * @param {String} v URL a ser carregada
     */
    this.setUrl = function (v){this.getElemento().src = url = v;};
    /**
     * @function {boolean} getBorda
     * Retorna se o Frame possui ou n&atilde;o uma borda
     * @return <i>true</i> se o Frame possui uma borda, <i>false</i> caso contrario.
     */
    this.getBorda = function (){return borda;};
    /**
     * @function {void} setBorda
     * Define se o Frame possui ou n&atilde;o uma borda
     * @param {boolean} v Valor da propriedade
     */
    this.setBorda = function (v){
        this.getElemento().frameborder = borda = v;
        this.getElemento().style.border = v ? "":"none";
    };
    /**
     * @function {JSDialogEdit.Frame.TiposRolagem} getBarraRolagem
     * Retorna a forma como o Frame vai tratar as barras de rolagem
     * @return Valor da propriedade
     */
    this.getBarraRolagem = function (){return barraRolagem;};
    /**
     * @function {void} setBarraRolagem
     * Define a forma como o Frame vai tratar as barras de rolagem
     * @param {JSDialogEdit.Frame.TiposRolagem} v Tipo de Barra de Rolagem
     */
    this.setBarraRolagem = function (v){
        barraRolagem = v;
        this.getElemento().scrolling = v;
        
        switch(v) {
            case JSDialogEdit.Frame.TiposRolagem.AUTO:
                this.getElemento().style.overflow = "auto";
                break;
            case JSDialogEdit.Frame.TiposRolagem.VISIVEL:
                this.getElemento().style.overflow = "scroll";
                break;
            case JSDialogEdit.Frame.TiposRolagem.OCULTA:
                this.getElemento().style.overflow = "hidden";
                break;
            default:
                this.getElemento().scrolling = "auto";
                this.getElemento().style.overflow = "auto";
                barraRolagem = "auto";
        }
    };
    
    var init = function () {
        self.getPropriedade("Valor").habilitado = false;
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        self.getPropriedade("Conector").habilitado = false;
        self.getPropriedade("Campo").habilitado = false;
        self.getPropriedade("Tooltip").habilitado = false;
        self.getPropriedade("TabIndex").habilitado = false;
        self.getPropriedade("Desabilitado").habilitado = false;
        self.getEvento("OnFocus").habilitado = false;
        self.getEvento("OnBlur").habilitado = false;
        self.getEvento("OnMouseOver").habilitado = false;
        self.getEvento("OnMouseOut").habilitado = false;
        self.getEvento("OnMouseDown").habilitado = false;
        self.getEvento("OnMouseUp").habilitado = false;
        self.getEvento("OnMouseMove").habilitado = false;
        self.getEvento("OnClick").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "URL",
            "descricao" : "Define a URL que sera carregada para este Frame",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Valor,
            "get" : "getUrl",
            "set" : "setUrl",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "Borda",
            "descricao" : "Define se o Frame possui ou n&atilde;o uma borda",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Boolean,
            "get" : "getBorda",
            "set" : "setBorda",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "BarraRolagem",
            "descricao" : "Define como o frame exibira as Barras de Rolagem",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Lista,
            "get" : "getBarraRolagem",
            "set" : "setBarraRolagem",
            "habilitado" : true,
            "opcoes" : JSDialogEdit.Frame.TiposRolagem
        }));
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Frame, JSDialogEdit.Componente);

/** 
 * @struct {static final JSONObject} JSDialogEdit.Frame.TiposRoalgem
 * Lista est&aacute;tica com os tipos de Barra de Rolagem para o Frame.
 * Valores possiveis:
 * <ul>
 * <li>AUTO - O navegador define se vai ser ou n&atilde;o necessaria a Barra de Rolagem</li>
 * <li>VISIVEL - A Barra de Rolagem SEMPRE estara visivel, mesmo se o conteudo for menor que a area visivel</li>
 * <li>OCULTA - A Barra de Rolagem NUNCA estara visivel, mesmo se o conteudo for maior que a area visivel</li>
 * </ul>
 */
JSDialogEdit.Frame.TiposRolagem = {"AUTO" : "auto", "VISIVEL" : "yes", "OCULTA" : "no"};

/**
 * @class {class} JSDialogEdit.Calendario
 * Classe representando um Calendario com todos os seus atributos
 * @constructor JSDialogEdit.Calendario Cria um novo objeto
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente
 */
JSDialogEdit.Calendario = function () {
    JSDialogEdit.Componente.call(this, "div"); //, arguments[0]);
    
    var self = this,
        propriedades = arguments[0] || null,
        divCalendario = this.getElemento(),
        tabelaCalendario = null,
        tabelaMeses = null,
        celulasCalendario = [],
        celulasMeses = [],
        dataReferencia = {"dia":0, "mes":0, "ano":0},
        offsetDiaSemana = 0,
        valor = null,
        formato = "dd/MM/yyyy",
        partesFormato = ["dd", "d", "MMMM", "MMM", "MM", "M", "yyyy", "wwww", "www", "w"],
        conversorFormato = {},
        listaDatasSelecionadas = [],
        listaMeses = ["Janeiro","Fevereiro","Marco","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
        listaMesesAbr = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
        listaDiaSemana = ["Domingo","Segunda","Ter&ccedil;a","Quarta","Quinta","Sexta","S&aacute;bado"],
        listaDiaSemanaAbr = ["Dom","Seg","Ter","Qua","Qui","Sex","Sab"],
        listaDiaSemanaSigla = ["D","S","T","Q","Q","S","S"],
        getValor = this.getValor,
        setValor = this.setValor;
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.Calendario";
    /** @property {final String} alturaMin Informa o tamanho minimo para a altura do Componente*/
    this.alturaMin = "167";
    /** @property {final String} larguraMin Informa o tamanho minimo para a largura do Componente */
    this.larguraMin = "140";
    
    /**
     * @function {Date} getValor
     * Retorna uma representa&cecedil;&atilde;o textual da data selecionada no Calendario, no formato definido
     * @return Retorna uma representa&cecedil;&atilde;o da data selecionada em formato textual
     */
    this.getValor = function () {
        /*if (valor === null) return "";
        var v = formato;
        for(var i = 0; i < partesFormato.length; i++) {
            v = v.replace(partesFormato[i], conversorFormato[partesFormato[i]]());
        }
        return v;*/
        return valor;
    };
    
    this.setValor = function (v) {
        if (!v.getFullYear) throw "JSDialogEdit.Calendario: ValorInvalidoException";
        valor = v;
        atualizaCalendario();
    };
    
    var criaCalendario = function () {
        var bodyCalendario = document.createElement("tbody"),
            cabecalho = null,
            rodape = null,
            linhasCalendario = [],
            hoje = new Date(),
            dia = "",
            mes = "",
            ano = "",
            x = 0;
        
        cabecalho = document.createElement("tr");
        
        celulasCalendario[42] = document.createElement("th");
        celulasCalendario[42].innerHTML = "&lt;";
        celulasCalendario[42].className = "jsdeCalendarioItem jsdeCalendarioCabecalho";
        celulasCalendario[42].onclick = mesAnterior;
        cabecalho.appendChild(celulasCalendario[42]);
        
        celulasCalendario[43] = document.createElement("th");
        celulasCalendario[43].innerHTML = listaMeses[hoje.getMonth()] + " " + hoje.getFullYear();
        celulasCalendario[43].colSpan = "5";
        celulasCalendario[43].className = "jsdeCalendarioItem jsdeCalendarioCabecalho";
        celulasCalendario[43].onclick = exibeMeses;
        cabecalho.appendChild(celulasCalendario[43]);
        
        celulasCalendario[44] = document.createElement("th");
        celulasCalendario[44].innerHTML = "&gt;";
        celulasCalendario[44].className = "jsdeCalendarioItem jsdeCalendarioCabecalho";
        celulasCalendario[44].onclick = mesSeguinte;
        cabecalho.appendChild(celulasCalendario[44]);
        
        bodyCalendario.appendChild(cabecalho);
        
        cabecalho = document.createElement("tr");
        for(x = 0; x < 7; x++) {
            celulasCalendario[x + 45] = document.createElement("th");
            celulasCalendario[x + 45].innerHTML = listaDiaSemanaSigla[x];
            celulasCalendario[x + 45].className = "jsdeCalendarioSemana";
            cabecalho.appendChild(celulasCalendario[x + 45]);
        }
        celulasCalendario[45].className += " jsdeCalendarioDomingo";
        bodyCalendario.appendChild(cabecalho);
        
        for(x = 0; x < 42; x++) {
            var y = parseInt(x / 7, 10);
            
            if (!linhasCalendario[y]) {
                linhasCalendario[y] = document.createElement("tr");
                linhasCalendario[y].className = "jsdeCalendarioLinha";
                bodyCalendario.appendChild(linhasCalendario[y]);
            }
            
            celulasCalendario[x] = document.createElement("td");
            celulasCalendario[x].innerHTML = x;
            linhasCalendario[y].appendChild(celulasCalendario[x]);
        }
        
        rodape = document.createElement("th");
        rodape.innerHTML = "Hoje: " + hoje.getDate() + " " + listaMesesAbr[hoje.getMonth()] + " " + hoje.getFullYear();
        rodape.colSpan = "7";
        rodape.className = "jsdeCalendarioItem jsdeCalendarioRodape";
        rodape.onclick = selecionaHoje;
        cabecalho = document.createElement("tr");
        cabecalho.appendChild(rodape);
        bodyCalendario.appendChild(cabecalho);
        
        tabelaCalendario = document.createElement("table");
        tabelaCalendario.cellPadding = "2";
        tabelaCalendario.cellSpacing = "0";
        tabelaCalendario.style.width = "100%";
        tabelaCalendario.style.height = "100%";
        tabelaCalendario.appendChild(bodyCalendario);
        
        divCalendario.className = "jsdeCalendario";
        divCalendario.appendChild(tabelaCalendario);
        
        dia = "0" + hoje.getDate();
        dia = dia.substr(dia.length - 2, 2);
        mes = "0" + (hoje.getMonth() + 1);
        mes = mes.substr(mes.length - 2, 2);
        ano = hoje.getFullYear();
        
        atualizaCalendario(dia + "/" + mes + "/" + ano);
    };
    
    var atualizaCalendario = function (data) {
        var vlr = self.getValor(),
            x = 0,
            d = 0,
            mes = 0,
            objDate = null,
            dataSelecionada = null,
            dataHoje = new Date();
        
        if (divCalendario.firstChild != tabelaCalendario) {
            divCalendario.removeChild(divCalendario.firstChild);
            divCalendario.appendChild(tabelaCalendario);
        }
        
        if (!data && vlr && vlr !== "") {
            if (vlr.split("/")[0] == dataReferencia.dia && vlr.split("/")[1] == dataReferencia.mes && vlr.split("/")[2] == dataReferencia.ano) {
               return;
            } else {
                data = vlr;
            }
        }
        
        if (vlr && vlr !== "") {
            dataSelecionada = new Date(vlr.split("/")[2], parseInt(vlr.split("/")[1], 10) - 1, vlr.split("/")[0]);
        }
        
        //confirmar condicao
        if (data) {
            dataReferencia.dia = data.split("/")[0];
            dataReferencia.mes = data.split("/")[1];
            dataReferencia.ano = data.split("/")[2];
        }
        
        objDate = new Date(dataReferencia.ano, parseInt(dataReferencia.mes, 10) - 1, 1);
        offsetDiaSemana = objDate.getDay();
        
        for(x = 0; x < 42; x++) {
            celulasCalendario[x].innerHTML = "";
            celulasCalendario[x].className = "";
            celulasCalendario[x].onclick = "";
        }
        
        mes = parseInt(dataReferencia.mes, 10) - 1;
        
        for(x = offsetDiaSemana, d = 1; objDate.getMonth() == mes; x++, d++) {
            celulasCalendario[x].innerHTML = ("0" + d).substr(("0" + d).length - 2, 2);
            celulasCalendario[x].className = "jsdeCalendarioItem jsdeCalendarioDia";
            if (x % 7 === 0) celulasCalendario[x].className += " jsdeCalendarioDomingo";
            celulasCalendario[x].onclick = selecionaData;
            
            if (objDate.toDateString() == dataHoje.toDateString()) celulasCalendario[x].className += " jsdeCalendarioDiaHoje";
            if (dataSelecionada && objDate.toString() == dataSelecionada.toString()) celulasCalendario[x].className += " jsdeCalendarioDiaSelecionado";
            objDate.setDate(objDate.getDate() + 1);
            if (objDate.getDate() == d) objDate.setDate(objDate.getDate() + 1);
        }
        
        celulasCalendario[43].innerHTML = listaMeses[parseInt(dataReferencia.mes, 10) - 1] + " " + dataReferencia.ano;
    };
    
    var mesAnterior = function (e) {
        var objDate, dia, mes, ano;
        
        objDate = new Date(dataReferencia.ano, parseInt(dataReferencia.mes, 10) - 1, 1);
        objDate.setDate(objDate.getDate()-1);
        dia = "01";
        mes = "0" + (objDate.getMonth() + 1);
        mes = mes.substr(mes.length - 2, 2);
        ano = objDate.getFullYear();
        
        atualizaCalendario(dia + "/" + mes + "/" + ano);
    };
    
    var mesSeguinte = function (e) {
        var objDate, dia, mes, ano;
        
        objDate = new Date(dataReferencia.ano, parseInt(dataReferencia.mes, 10) - 1, 1);
        objDate.setDate(objDate.getDate() + 31);
        dia = "01";
        mes = "0" + (objDate.getMonth() + 1);
        mes = mes.substr(mes.length - 2, 2);
        ano = objDate.getFullYear();
        
        atualizaCalendario(dia + "/" + mes + "/" + ano);
    };
    
    var selecionaData = function (e) {
        var elm, objDate, dia, mes, ano;
        
        e = e || event;
        elm = e.srcElement || e.target;
        
        if (elm.innerHTML === "") {
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
            return;
        }
        
        objDate = new Date(dataReferencia.ano, parseInt(dataReferencia.mes, 10) - 1, elm.innerHTML);
        dia = "0" + objDate.getDate();
        dia = dia.substr(dia.length - 2, 2);
        mes = "0" + (objDate.getMonth() + 1);
        mes = mes.substr(mes.length - 2, 2);
        ano = objDate.getFullYear();
        //self.setValor(dia + "/" + mes + "/" + ano);
        self.setValor(objDate);
        atualizaCalendario();
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    };
    
    var selecionaHoje = function (e) {
        var objDate, dia, mes, ano;
        e = e || event;
        
        objDate = new Date();
        dia = "0" + objDate.getDate();
        dia = dia.substr(dia.length - 2, 2);
        mes = "0" + (objDate.getMonth() + 1);
        mes = mes.substr(mes.length - 2, 2);
        ano = objDate.getFullYear();
        //self.setValor(dia + "/" + mes + "/" + ano);
        self.setValor(objDate);
        atualizaCalendario();
        
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    };
    
    var criaMeses = function () {
        var bodyTabela = document.createElement("tbody"),
            cabecalho = null,
            linhasTabela = [],
            hoje = new Date(),
            x = 0;
        
        cabecalho = document.createElement("tr");
        
        celulasMeses[12] = document.createElement("th");
        celulasMeses[12].innerHTML = "&lt;";
        celulasMeses[12].className = "jsdeCalendarioItem jsdeCalendarioCabecalho";
        celulasMeses[12].onclick = anoAnterior;
        cabecalho.appendChild(celulasMeses[12]);
        
        celulasMeses[13] = document.createElement("th");
        celulasMeses[13].innerHTML = hoje.getFullYear();
        celulasMeses[13].colSpan = "2";
        celulasMeses[13].className = "jsdeCalendarioCabecalho";
        celulasMeses[13].onclick = exibeMeses;
        cabecalho.appendChild(celulasMeses[13]);
        
        celulasMeses[14] = document.createElement("th");
        celulasMeses[14].innerHTML = "&gt;";
        celulasMeses[14].className = "jsdeCalendarioItem jsdeCalendarioCabecalho";
        celulasMeses[14].onclick = anoSeguinte;
        cabecalho.appendChild(celulasMeses[14]);
        
        bodyTabela.appendChild(cabecalho);

        for(x = 0; x < 12; x++) {
            var y = parseInt(x / 4, 10);
            
            if (!linhasTabela[y]) {
                linhasTabela[y] = document.createElement("tr");
                bodyTabela.appendChild(linhasTabela[y]);
            }
            
            celulasMeses[x] = document.createElement("td");
            celulasMeses[x].className = "jsdeCalendarioItem jsdeCalendarioMes";
            celulasMeses[x].innerHTML = listaMesesAbr[x];
            celulasMeses[x].onclick = selecionaMes;
            linhasTabela[y].appendChild(celulasMeses[x]);
        }
        
        tabelaMeses = document.createElement("table");
        tabelaMeses.cellPadding = "0";
        tabelaMeses.cellSpacing = "0";
        tabelaMeses.appendChild(bodyTabela);
    };
    
    var exibeMeses = function (e) {
        divCalendario.removeChild(divCalendario.firstChild);
        divCalendario.appendChild(tabelaMeses);
        mantemCalendario = true;
        self.getElemento().focus();
    };
    
    var atualizaMeses = function (data) {
        dataReferencia.dia = data.split("/")[0];
        dataReferencia.mes = data.split("/")[1];
        dataReferencia.ano = data.split("/")[2];
        
        celulasMeses[13].innerHTML = dataReferencia.ano;
    };
    
    var anoAnterior = function (e) {
        atualizaMeses(dataReferencia.dia + "/" + dataReferencia.mes + "/" + (parseInt(dataReferencia.ano, 10) - 1));
    };
    
    var anoSeguinte = function (e) {
        atualizaMeses(dataReferencia.dia + "/" + dataReferencia.mes + "/" + (parseInt(dataReferencia.ano, 10) + 1));
    };
    
    var selecionaMes = function (e) {
        var dia = "01",
            mes = null,
            ano  = dataReferencia.ano,
            elm = null,
            x = 0;
        
        e = e || event;
        elm = e.srcElement || e.target;
        
        for(x = 0; x < 12; x++) {
            if (elm.innerHTML == listaMesesAbr[x]) {
                mes = "0" + (x + 1);
                mes = mes.substr(mes.length - 2, 2);
                break;
            }
        }
        
        atualizaCalendario(dia + "/" + mes + "/" + ano);
    };
    
    var init = function () {
        conversorFormato.dd   = function () {return ("0" + valor.getDate()).substr(valor.getDate().toString().length - 1, 2);};
        conversorFormato.d    = function () {return valor.getDate();};
        conversorFormato.MMMM = function () {return listaMeses[valor.getMonth()];};
        conversorFormato.MMM  = function () {return listaMesesAbr[valor.getMonth()];};
        conversorFormato.MM   = function () {return ("0" + (valor.getMonth() + 1)).substr((valor.getMonth() + 1).toString().length - 1, 2);};
        conversorFormato.M    = function () {return valor.getMonth() + 1;};
        conversorFormato.yyyy = function () {return valor.getFullYear();};
        conversorFormato.wwww = function () {return listaDiaSemana[valor.getDay()];};
        conversorFormato.www  = function () {return listaDiaSemanaAbr[valor.getDay()];};
        conversorFormato.w    = function () {return listaDiaSemanaSigla[valor.getDay()];};

        criaCalendario();
        criaMeses();
        
        self.getPropriedade("Valor").tipo = "object";
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        self.getPropriedade("Tooltip").habilitado = false;
        self.getPropriedade("TabIndex").habilitado = false;
        self.getPropriedade("Desabilitado").habilitado = false;
        self.getPropriedade("Estilos").habilitado = false;
        self.getEvento("OnFocus").habilitado = false;
        self.getEvento("OnBlur").habilitado = false;
        self.getEvento("OnMouseOver").habilitado = false;
        self.getEvento("OnMouseOut").habilitado = false;
        self.getEvento("OnMouseDown").habilitado = false;
        self.getEvento("OnMouseUp").habilitado = false;
        self.getEvento("OnMouseMove").habilitado = false;
        self.getEvento("OnClick").habilitado = false;
        
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.Calendario, JSDialogEdit.Componente);

/**
 * @class {class} JSDialogEdit.BotaoMenu
 * Classe representando um BotaoMenu com todos os seus atributos
 * @constructor JSDialogEdit.BotaoMenu Cria um novo objeto
 * @param {optional JSONObject} arguments {@link JSONObject} com o nome/valor das propriedades a serem atribu&iacute;dos ao Componente
 */
JSDialogEdit.BotaoMenu = function () {
    JSDialogEdit.Componente.call(this, "div"); //, arguments[0]);
    
    var self = this,
        propriedades = arguments[0] || null,
        botaoMenu = this.getElemento(),
        botao = null,
        seta = null,
        menu = null,
        fonteDados = "",
        campoDados = "",
        tabIndex = "",
        filhos = [],
        id = null,
        toObject = this.toObject,
        setValor = this.setValor,
        setDesabilitado = this.setDesabilitado;
    
    var onfocus = function (e){};
    var onblur = function (e){};
    var onmouseover = function (e){};
    var onmouseout = function (e){};
    var onmousedown = function (e){};
    var onmouseup = function (e){};
    var onmousemove = function (e){};
    var onclick = function (e){};
    
    /** @property {final String} CLASSE Informa o nome da classe construtora do objeto */
    this.CLASSE = "JSDialogEdit.BotaoMenu";
    this.eventoPadrao = "OnClick";
    
    /**
     * @function {JSONObject} toObject
     * Serializa o Objeto no formato JSON com os dados das Propriedades e Eventos da classe.
     * @return Objeto JSON com as informa&ccedil;&otilde;es.
     */
    this.toObject = function () {
        var obj = toObject.call(this);
        obj.filhos = [];
        for(var x = 0; x < filhos.length; x++) obj.filhos.push(filhos[x].toObject());
        return obj;
    };
    /**
     * @function {void} parseElemento
     * Utilizado internamente para processar os c&oacute;digos fonte gerados pelo Editor.
     * Realiza o processamento deste Componente em um elemento DOM.HTMLElement, podendo assim ser inserido em uma p&aacute;gina.
     */
    this.parseElemento = function () {
        onfocus = new Function("e", this.getOnFocus());
        onblur = new Function("e", this.getOnBlur());
        onmouseover = new Function("e", this.getOnMouseOver());
        onmouseout = new Function("e", this.getOnMouseOut());
        onmousedown = new Function("e", this.getOnMouseDown());
        onmouseup = new Function("e", this.getOnMouseUp());
        onmousemove = new Function("e", this.getOnMouseMove());
        onclick = new Function("e", this.getOnClick());
    };
    /**
     * @function {String} getId
     * Retorna o valor do IDentificador do componente utilizado para identificar de forma unica o botao na pagima HTML.
     * @return Propriedade ID do componente e do elemento HTML na p&aacute;gina
     */
    this.getId = function () {return id;};
    /**
     * @function {void} setId
     * Define o valor do IDentificador do botao e do elemento HTML que o representa na p&aacute;gina
     * @param {String} v Valor do ID a ser definido
     */
    this.setId = function (v) {
        if (v === "") return;
        var valor = this.getValor();
        if (id == valor || valor === "") this.setValor(v);
        botaoMenu.id = id = v;
    };
    /**
     * @function {void} setValor
     * Define o valor do Botao
     * @param {String} v valor
     */
    this.setValor = function ___jsdialogedit_botaomenu_setvalor(v) {
        setValor.call(this, v);
        botao.innerHTML = v;
    };
    /**
     * @function {int} getTabIndex
     * Retorna a posi&ccedil;&atilde;o do Componente na ordem de tabula&cecedil;&atilde;o do documento
     * @return Retorna o indice do componente dentro da Ordem de Tabula&ccedil;&atilde;o
     */
    this.getTabIndex   = function () {
        return tabIndex;
    };
    /**
     * @function {void} setTabIndex
     * Define a posi&ccedil;&atilde;o do Componente na ordem de tabula&cecedil;&atilde;o do documento
     * @param {int} v Valor para o indice do componente
     */
    this.setTabIndex   = function (v) {
        if(isNaN(v)) return;
        botao.tabIndex = tabIndex = v;
    };
    /**
     * @function {void} setDesabilitado
     * Define se Componente esta desabilitado ou n&atilde;o
     * @param {boolean} v Valor a ser defindo para a propriedades
     */
    this.setDesabilitado = function (v) {
        setDesabilitado.call(this, v);
        
        if (!this.getConteiner() || this.getConteiner().getMode() !== "edicao") {
            botao.disabled = v;
            seta.disabled = v;
        }
    };
    /**
     * @function {String} getFonteDados
     * Retorna o ID do componente de Conexao de onde as op&ccedil;&otilde;es disponiveis ser&atilde;o carregadas
     * @return ID do componente de Conexao
     */
    this.getFonteDados = function () {return fonteDados;};
    /**
     * @function {void} setFonteDados
     * Define o ID do componente de Conexao de onde as op&ccedil;&otilde;es disponiveis ser&atilde;o carregadas.
     * Ao definir esta propriedade, caso existam itens inseridos na propriedade Opcoes, as mesmas ser&atilde;o excluidas
     * @param {String} v ID do componente de Conexao
     */
    this.setFonteDados = function (v) {
        this.getElemento().options.length = 0;
        filhos.length = 0;
        fonteDados = v;
        self.getPropriedade("Opcoes").habilitado = v === "";
    };
    /**
     * @function {String} getCampoDados
     * Retorna o nome do campo do componente de Conexao de onde o texto das op&ccedil;&otilde;es disponiveis ser&atilde;o carregadas
     * @return Nome do campo do componente de Conexao
     */
    this.getCampoDados = function () {return campoDados;};
    /**
     * @function {void} setCampoDados
     * Define o nome do campo do componente de Conexao de onde o texto das op&ccedil;&otilde;es disponiveis ser&atilde;o carregadas.
     * Este texto estara visivel para o usu&aacute;rio final selecionar
     * @param {String} Nome do campo do componente de Conexao
     */
    this.setCampoDados = function (v) {campoDados = v;};
    /**
     * @function {JSONObject} retornaListaCampoDados
     * Retorna uma lista com os campos do componente ConexaoXML informado
     * @param {String} conexao ID do componente ConexaoXML a ser lido
     */
    this.retornaListaCampoDados = function (conexao) {
        if (conexao === undefined) conexao = this.getFonteDados();
        return this.getConteiner().retornaListaCampos(conexao);
    };
    /**
     * @function {Array<MenuItem>} getFilhos
     * Retorna um array de MenuItem
     * @return Opcoes disponiveis para o usu&aacute;rio
     */
    this.getFilhos = function () {return filhos;};
    /**
     * @function {MenuItem} getFilho
     * Retorna o MenuItem com o nome informado
     * @return MenuItem com o nome informado
     */
    this.getFilho = function (id) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x].getId() == id) return filhos[x];
        }
        return null;
    };
    this.addFilho = function (c) {
        if (c instanceof JSDialogEdit.MenuItem) {
            c.setConteiner(this);
            filhos.push(c);
            menu.appendChild(c.getElemento());
        } else {
            throw "JSDialogEdit.BotaoMenu: FilhoInvalidoException";
        }
    };
    this.removeFilho = function (c) {
        for(var x = 0; x < filhos.length; x++) {
            if (filhos[x] === c) {
                menu.removeChild(c.getElemento());
                delete filhos[x];
                filhos.splice(x, 1);
                break;
            }
        }
    };
    this.removeTodosFilhos = function () {
        while(filhos.length > 0) {
            menu.removeChild(filhos[0].getElemento());
            delete filhos[0];
            filhos.splice(0, 1);
        }
    };
    this.indexOf = function (c) {
        for(var x = 0; x < filhos.length; x++) if (c === filhos[x]) return x;
        return -1;
    };
    this.novoMenu = function () {
        var item = new JSDialogEdit.MenuItem({
            "ID"    : "Item" + (filhos.length + 1),
            "Texto" : "Item " + (filhos.length + 1)
        });
        this.addFilho(item);
        return item;
    };
    /**
     * @function {JSDialogEdit.Objeto} findFilho
     * Localiza um Componente pelo ID independente de onde esteja na arvore de conteiners
     * @para {String} id Nome unico que identifica (ID) o componente a ser localizado
     */
    this.findFilho = function (id) {
        var c = this.getFilho(id);
        var chamador = arguments[1] || "";
        if (c === null) { 
            for(var x = 0; x < filhos.length; x++) {
                if (filhos[x].findFilho && filhos[x].getId() != chamador) {
                    c = filhos[x].findFilho(id, this.getId());
                    if (c !== null) break;
                }
            }
            
            if (c === null && this.getConteiner() !== null && this.getConteiner().getId() != chamador && !(this.getConteiner() instanceof JSDialogEdit.GerenciadorJanela)) {
                c = this.getConteiner().findFilho(id, this.getId());
            }
        }
        return c;
    };
    
    var alternaExbicao = function (e) {
        if(self.getConteiner() && self.getConteiner().getMode() === "edicao") return;
        
        if (seta.className.indexOf("jsdeBotaoMenuAtivo") == -1) {
            seta.className += " jsdeBotaoMenuAtivo";
            menu.className += " jsdeMenuAtivo jsdeBotaoMenuAtivo";
        } else {
            seta.className = seta.className.replace(" jsdeBotaoMenuAtivo", "");
            menu.className = menu.className.replace(" jsdeMenuAtivo jsdeBotaoMenuAtivo", "");
        }
    };
    var init = function ___jsdialogedit_botaomenu_inner_init() {
        botao = document.createElement("div");
        botao.type = "button";
        botao.className = "jsdeBotaoMenuBotao";
        botao.onfocus     = function (e) {e = e || event;return onfocus.call(self, e);};
        botao.onblur      = function (e) {e = e || event;return onblur.call(self, e);};
        botao.onmouseover = function (e) {e = e || event;return onmouseover.call(self, e);};
        botao.onmouseout  = function (e) {e = e || event;return onmouseout.call(self, e);};
        botao.onmousedown = function (e) {e = e || event;return onmousedown.call(self, e);};
        botao.onmouseup   = function (e) {e = e || event;return onmouseup.call(self, e);};
        botao.onmousemove = function (e) {e = e || event;return onmousemove.call(self, e);};
        botao.onclick     = function (e) {e = e || event;return onclick.call(self, e);};
        
        seta = document.createElement("div");
        seta.type = "button";
        seta.className = "jsdeBotaoMenuSeta";
        seta.appendChild(document.createTextNode("\u25BC")); // &#9660;
        seta.tabIndex = -1;
        seta.onclick = alternaExbicao;
        
        menu = document.createElement("ul");
        menu.className = "jsdeMenuCaixa";
        menu.onclick = alternaExbicao;
        
        botaoMenu.className = "jsdeBotaoMenu";
        botaoMenu.appendChild(seta);
        botaoMenu.appendChild(botao);
        botaoMenu.appendChild(menu);
        
        self.resizeAxy = "x";
        
        self.getPropriedade("Inferior").habilitado = false;
        self.getPropriedade("Direita").habilitado = false;
        self.getPropriedade("Altura").habilitado = false;
        self.getPropriedade("Conector").habilitado = false;
        self.getPropriedade("Campo").habilitado = false;
        
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "NovoMenu",
            "descricao" : "Inclui um item no menu",
            "tipo" : JSDialogEdit.Propriedade.Tipos.Acao,
            "funcao" : "novoMenu",
            "habilitado" : true,
            "refresh" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "FonteDados",
            "descricao" : "Indica que os itens do menu virao de um Campo do elemento Conexao XML",
            "tipo" : JSDialogEdit.Propriedade.Tipos.ListaFuncao,
            "get" : "getFonteDados",
            "set" : "setFonteDados",
            "funcao" : "retornaListaConexaoXML",
            "habilitado" : true
        }));
        self.addPropriedade(new JSDialogEdit.Propriedade({
            "nome" : "CampoDados",
            "descricao" : "Indica de qual campo do elemento Conexao XML virá o texto a ser exibido",
            "tipo" : JSDialogEdit.Propriedade.Tipos.ListaFuncao,
            "get" : "getCampoDados",
            "set" : "setCampoDados",
            "funcao" : "retornaListaCampoDados",
            "habilitado" : true
        }));
    
        if (propriedades) {
            for(var item in propriedades) {
                self.set(item, propriedades[item]);
            }
        }
    };
    
    init();
};
JSDialogEdit.Core.register(JSDialogEdit.BotaoMenu, JSDialogEdit.Componente);

/**
 * @class {static final} JSDialogEdit.XML
 * Classe est&aacute;tica de apoio para trabalhar com os documentos em XML
 * http://www.hardcode.nl/subcategory_1/article_280-javascript-string-to-xml-object%3A.htm
 */
JSDialogEdit.XML = {
    /**
     * @function {String} xml2String
     * Converte um documento XML em uma string
     * @param {DOM.XMLDocument} xmlDoc Documento XML a ser convertido em uma String
     * @return Retorna uma representa&cecedil;&atilde;o do documento XML em formato textual
     */
    xml2String : function (xmlDoc) {
        if (window.ActiveXObject) {
            return xmlDoc.xml; //ie
        } else {
            return (new XMLSerializer()).serializeToString(xmlDoc); //fx
        }
    },
    /**
     * @function {DOM.XMLDocument} String2xml
     * Converte uma string em um Documento XML
     * @param {String} dados String a ser convertida em um documento XML
     * @return Retorna um Documento XML de acordo com a string
     */
    String2xml : function (dados) {
        var doc = null;
        
        if (window.ActiveXObject){
          doc = new ActiveXObject("Microsoft.XMLDOM");
          doc.async = "false";
          doc.loadXML(dados);
        } else {
          var parser = new DOMParser();
          doc = parser.parseFromString(dados,"text/xml");
        }
        return doc;
    },
    /**
     * @function {DOM.document} newDocument
     * Cria um novo documento
     * @param {String} rootTagName Noma da tag raiz
     * @param {String} namespaceURL Namespace do documento a ser criado
     * @return Retorna um novo documento
     */
    newDocument : function (rootTagName, namespaceURL) {
        if (!rootTagName) rootTagName = "";
        if (!namespaceURL) namespaceURL = "";

        if (document.implementation && document.implementation.createDocument) {
            // This is the W3C standard way to do it
            return document.implementation.createDocument(namespaceURL, rootTagName, null);
        } else { // This is the IE way to do it
            // Create an empty document as an ActiveX object
            // If there is no root element, this is all we have to do
            var doc = new ActiveXObject("MSXML2.DOMDocument");

            // If there is a root tag, initialize the document
            if (rootTagName) {
                // Look for a namespace prefix
                var prefix = "";
                var tagname = rootTagName;
                var p = rootTagName.indexOf(":");
                if (p != -1) {
                    prefix = rootTagName.substring(0, p);
                    tagname = rootTagName.substring(p + 1);
                }

                // If we have a namespace, we must have a namespace prefix
                // If we don"t have a namespace, we discard any prefix
                if (namespaceURL) {
                    if (!prefix) prefix = "a0"; // What Firefox uses
                } else {
                    prefix = "";
                }

                // Create the root element (with optional namespace) as a
                // string of text
                var text = "<" + (prefix ? (prefix + ":") : "") + tagname +
                    (namespaceURL ?
                        (" xmlns:" + prefix + "=\"" + namespaceURL + "\"")
                        : ""
                    ) +
                    "/>";
                // And parse that text into the empty document
                doc.loadXML(text);
            }
            return doc;
        }
    }
};

if (!window.JSON) {
    window.JSON = {
        parse : function (obj) {return obj.parseJSON();},
        stringify : function (obj) {return obj.toJSONString();}
    };
}

/*
 * @class {class} Object
 * Classe padr&atilde;o da linguagem ECMAScript que todas as outras classes herdam.<br>
 * Utilizada no JSDialogEdit como uma estrutura do tipo {chave:valor} para passagem de parametros entre metodos.
 *
 * @class {class} DOM.HTMLElement
 * Representa qualquer elemento da linguagem HTML
 *
 * @class {class} String
 * Representa uma sequencia de caracteres da linguagem JavaScript
 *
 * @class {class} Event
 * Classe da linguagem JavaScript com as informa&ccedil;&otilde;es sobre um evento ocorrido na pagina HTML
 */



