!function(t){var e={};function a(n){if(e[n])return e[n].exports;var r=e[n]={i:n,l:!1,exports:{}};return t[n].call(r.exports,r,r.exports,a),r.l=!0,r.exports}a.m=t,a.c=e,a.d=function(t,e,n){a.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},a.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},a.t=function(t,e){if(1&e&&(t=a(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)a.d(n,r,function(e){return t[e]}.bind(null,r));return n},a.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return a.d(e,"a",e),e},a.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},a.p="",a(a.s=18)}([function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.TextMacrosMethods=void 0;var n=a(3),r=a(13),o=a(14);e.TextMacrosMethods={Comment:function(t,e){for(;t.i<t.string.length&&"\n"!==t.string.charAt(t.i);)t.i++;t.i++},Math:function(t,e){t.saveText();for(var a,r,o=t.i,s=0;r=t.GetNext();)switch(a=t.i++,r){case"\\":")"===t.GetCS()&&(r="\\(");case"$":if(0===s&&e===r){var i=t.texParser.configuration,c=new n.default(t.string.substr(o,a-o),t.stack.env,i).mml();return void t.PushMath(c)}break;case"{":s++;break;case"}":0===s&&t.Error("ExtraCloseMissingOpen","Extra close brace or missing open brace"),s--}t.Error("MathNotTerminated","Math-mode is not properly terminated")},MathModeOnly:function(t,e){t.Error("MathModeOnly","'%1' allowed only in math mode",e)},Misplaced:function(t,e){t.Error("Misplaced","'%1' can not be used here",e)},OpenBrace:function(t,e){var a=t.stack.env;t.envStack.push(a),t.stack.env=Object.assign({},a)},CloseBrace:function(t,e){t.envStack.length?(t.saveText(),t.stack.env=t.envStack.pop()):t.Error("ExtraCloseMissingOpen","Extra close brace or missing open brace")},OpenQuote:function(t,e){t.string.charAt(t.i)===e?(t.text+="“",t.i++):t.text+="‘"},CloseQuote:function(t,e){t.string.charAt(t.i)===e?(t.text+="”",t.i++):t.text+="’"},Tilde:function(t,e){t.text+=" "},Space:function(t,e){for(t.text+=" ";t.GetNext().match(/\s/);)t.i++},SelfQuote:function(t,e){t.text+=e.substr(1)},Insert:function(t,e,a){t.text+=a},Accent:function(t,e,a){var n=t.ParseArg(name),r=t.create("token","mo",{},a);t.addAttributes(r),t.Push(t.create("node","mover",[n,r]))},Emph:function(t,e){var a="-tex-mathit"===t.stack.env.mathvariant?"normal":"-tex-mathit";t.Push(t.ParseTextArg(e,{mathvariant:a}))},SetFont:function(t,e,a){t.saveText(),t.stack.env.mathvariant=a},SetSize:function(t,e,a){t.saveText(),t.stack.env.mathsize=a},CheckAutoload:function(t,e){var a=t.configuration.packageData.get("autoload"),n=t.texParser;e=e.slice(1);var o=n.lookup("macro",e);if(!o||a&&o._func===a.Autoload){if(n.parse("macro",[n,e]),!o)return;r.retryAfter(Promise.resolve())}n.parse("macro",[t,e])},Macro:o.default.Macro,Spacer:o.default.Spacer,Hskip:o.default.Hskip,rule:o.default.rule,Rule:o.default.Rule,HandleRef:o.default.HandleRef}},function(t,e,a){"use strict";var n,r=this&&this.__extends||(n=function(t,e){return(n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var a in e)e.hasOwnProperty(a)&&(t[a]=e[a])})(t,e)},function(t,e){function a(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(a.prototype=e.prototype,new a)}),o=this&&this.__values||function(t){var e="function"==typeof Symbol&&Symbol.iterator,a=e&&t[e],n=0;if(a)return a.call(t);if(t&&"number"==typeof t.length)return{next:function(){return t&&n>=t.length&&(t=void 0),{value:t&&t[n++],done:!t}}};throw new TypeError(e?"Object is not iterable.":"Symbol.iterator is not defined.")},s=this&&this.__read||function(t,e){var a="function"==typeof Symbol&&t[Symbol.iterator];if(!a)return t;var n,r,o=a.call(t),s=[];try{for(;(void 0===e||e-- >0)&&!(n=o.next()).done;)s.push(n.value)}catch(t){r={error:t}}finally{try{n&&!n.done&&(a=o.return)&&a.call(o)}finally{if(r)throw r.error}}return s},i=this&&this.__spread||function(){for(var t=[],e=0;e<arguments.length;e++)t=t.concat(s(arguments[e]));return t};Object.defineProperty(e,"__esModule",{value:!0}),e.TextParser=void 0;var c=a(3),u=a(9),l=a(10),p=a(11),m=a(12),h=a(2),f=function(t){function e(e,a,n,r){var o=t.call(this,e,a,n)||this;return o.level=r,o}return r(e,t),Object.defineProperty(e.prototype,"texParser",{get:function(){return this.configuration.packageData.get("textmacros").texParser},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"tags",{get:function(){return this.texParser.tags},enumerable:!1,configurable:!0}),e.prototype.mml=function(){return null!=this.level?this.create("node","mstyle",this.nodes,{displaystyle:!1,scriptlevel:this.level}):1===this.nodes.length?this.nodes[0]:this.create("node","inferredMrow",this.nodes)},e.prototype.Parse=function(){this.text="",this.nodes=[],this.envStack=[],t.prototype.Parse.call(this)},e.prototype.saveText=function(){if(this.text){var t=this.stack.env.mathvariant,e=l.default.internalText(this,this.text,t?{mathvariant:t}:{});this.text="",this.Push(e)}},e.prototype.Push=function(e){if(this.text&&this.saveText(),e instanceof h.StopItem)return t.prototype.Push.call(this,e);e instanceof h.StyleItem?this.stack.env.mathcolor=this.stack.env.color:e instanceof p.AbstractMmlNode&&(this.addAttributes(e),this.nodes.push(e))},e.prototype.PushMath=function(t){var e,a,n=this.stack.env;try{for(var r=o(["mathsize","mathcolor"]),s=r.next();!s.done;s=r.next()){var i=s.value;n[i]&&!t.attributes.getExplicit(i)&&(t.isToken||t.isKind("mstyle")||(t=this.create("node","mstyle",[t])),m.default.setAttribute(t,i,n[i]))}}catch(t){e={error:t}}finally{try{s&&!s.done&&(a=r.return)&&a.call(r)}finally{if(e)throw e.error}}t.isKind("inferredMrow")&&(t=this.create("node","mrow",t.childNodes)),this.nodes.push(t)},e.prototype.addAttributes=function(t){var e,a,n=this.stack.env;if(t.isToken)try{for(var r=o(["mathsize","mathcolor","mathvariant"]),s=r.next();!s.done;s=r.next()){var i=s.value;n[i]&&!t.attributes.getExplicit(i)&&m.default.setAttribute(t,i,n[i])}}catch(t){e={error:t}}finally{try{s&&!s.done&&(a=r.return)&&a.call(r)}finally{if(e)throw e.error}}},e.prototype.ParseTextArg=function(t,a){return new e(this.GetArgument(t),a=Object.assign(Object.assign({},this.stack.env),a),this.configuration).mml()},e.prototype.ParseArg=function(t){return new e(this.GetArgument(t),this.stack.env,this.configuration).mml()},e.prototype.Error=function(t,e){for(var a=[],n=2;n<arguments.length;n++)a[n-2]=arguments[n];throw new(u.default.bind.apply(u.default,i([void 0,t,e],a)))},e}(c.default);e.TextParser=f},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.StartItem=MathJax._.input.tex.base.BaseItems.StartItem,e.StopItem=MathJax._.input.tex.base.BaseItems.StopItem,e.OpenItem=MathJax._.input.tex.base.BaseItems.OpenItem,e.CloseItem=MathJax._.input.tex.base.BaseItems.CloseItem,e.PrimeItem=MathJax._.input.tex.base.BaseItems.PrimeItem,e.SubsupItem=MathJax._.input.tex.base.BaseItems.SubsupItem,e.OverItem=MathJax._.input.tex.base.BaseItems.OverItem,e.LeftItem=MathJax._.input.tex.base.BaseItems.LeftItem,e.RightItem=MathJax._.input.tex.base.BaseItems.RightItem,e.BeginItem=MathJax._.input.tex.base.BaseItems.BeginItem,e.EndItem=MathJax._.input.tex.base.BaseItems.EndItem,e.StyleItem=MathJax._.input.tex.base.BaseItems.StyleItem,e.PositionItem=MathJax._.input.tex.base.BaseItems.PositionItem,e.CellItem=MathJax._.input.tex.base.BaseItems.CellItem,e.MmlItem=MathJax._.input.tex.base.BaseItems.MmlItem,e.FnItem=MathJax._.input.tex.base.BaseItems.FnItem,e.NotItem=MathJax._.input.tex.base.BaseItems.NotItem,e.DotsItem=MathJax._.input.tex.base.BaseItems.DotsItem,e.ArrayItem=MathJax._.input.tex.base.BaseItems.ArrayItem,e.EqnArrayItem=MathJax._.input.tex.base.BaseItems.EqnArrayItem,e.EquationItem=MathJax._.input.tex.base.BaseItems.EquationItem},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=MathJax._.input.tex.TexParser.default},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.isObject=MathJax._.components.global.isObject,e.combineConfig=MathJax._.components.global.combineConfig,e.combineDefaults=MathJax._.components.global.combineDefaults,e.combineWithMathJax=MathJax._.components.global.combineWithMathJax,e.MathJax=MathJax._.components.global.MathJax},function(t,e,a){"use strict";var n;Object.defineProperty(e,"__esModule",{value:!0}),e.textBase=void 0;var r=a(6),o=a(7),s=a(8),i=a(2),c=a(1),u=a(0);function l(t,e,a,n){var r=t.configuration.packageData.get("textmacros");return t instanceof c.TextParser||(r.texParser=t),[new c.TextParser(e,n?{mathvariant:n}:{},r.parseOptions,a).mml()]}a(15),e.textBase=r.Configuration.local({handler:{character:["command","text-special"],macro:["text-macros"]},fallback:{character:function(t,e){t.text+=e},macro:function(t,e){var a=t.texParser,n=a.lookup("macro",e);n&&n._func!==u.TextMacrosMethods.Macro&&t.Error("MathMacro","%1 is only supported in math mode","\\"+e),a.parse("macro",[n?t:a,e])}},items:(n={},n[i.StartItem.prototype.kind]=i.StartItem,n[i.StopItem.prototype.kind]=i.StopItem,n[i.MmlItem.prototype.kind]=i.MmlItem,n[i.StyleItem.prototype.kind]=i.StyleItem,n)}),r.Configuration.create("textmacros",{config:function(t,a){var n=new r.ParserConfiguration([]);n.append(e.textBase),n.init();var i=new o.default(n,[]);i.options=a.parseOptions.options,n.config(a),s.TagsFactory.addTags(n.tags),i.tags=s.TagsFactory.getDefault(),i.tags.configuration=i,i.packageData=a.parseOptions.packageData,i.packageData.set("textmacros",{parseOptions:i,jax:a,texParser:null}),i.options.internalMath=l},preprocessors:[function(t){var e=t.data.packageData.get("textmacros");e.parseOptions.nodeFactory.setMmlFactory(e.jax.mmlFactory)}]})},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.Configuration=MathJax._.input.tex.Configuration.Configuration,e.ConfigurationHandler=MathJax._.input.tex.Configuration.ConfigurationHandler,e.ParserConfiguration=MathJax._.input.tex.Configuration.ParserConfiguration},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=MathJax._.input.tex.ParseOptions.default},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.Label=MathJax._.input.tex.Tags.Label,e.TagInfo=MathJax._.input.tex.Tags.TagInfo,e.AbstractTags=MathJax._.input.tex.Tags.AbstractTags,e.NoTags=MathJax._.input.tex.Tags.NoTags,e.AllTags=MathJax._.input.tex.Tags.AllTags,e.TagsFactory=MathJax._.input.tex.Tags.TagsFactory},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=MathJax._.input.tex.TexError.default},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=MathJax._.input.tex.ParseUtil.default},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.TEXCLASS=MathJax._.core.MmlTree.MmlNode.TEXCLASS,e.TEXCLASSNAMES=MathJax._.core.MmlTree.MmlNode.TEXCLASSNAMES,e.indentAttributes=MathJax._.core.MmlTree.MmlNode.indentAttributes,e.AbstractMmlNode=MathJax._.core.MmlTree.MmlNode.AbstractMmlNode,e.AbstractMmlTokenNode=MathJax._.core.MmlTree.MmlNode.AbstractMmlTokenNode,e.AbstractMmlLayoutNode=MathJax._.core.MmlTree.MmlNode.AbstractMmlLayoutNode,e.AbstractMmlBaseNode=MathJax._.core.MmlTree.MmlNode.AbstractMmlBaseNode,e.AbstractMmlEmptyNode=MathJax._.core.MmlTree.MmlNode.AbstractMmlEmptyNode,e.TextNode=MathJax._.core.MmlTree.MmlNode.TextNode,e.XMLNode=MathJax._.core.MmlTree.MmlNode.XMLNode},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=MathJax._.input.tex.NodeUtil.default},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.handleRetriesFor=MathJax._.util.Retries.handleRetriesFor,e.retryAfter=MathJax._.util.Retries.retryAfter},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=MathJax._.input.tex.base.BaseMethods.default},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=a(16),r=a(17),o=a(0);new n.MacroMap("text-special",{$:"Math","%":"Comment","^":"MathModeOnly",_:"MathModeOnly","&":"Misplaced","#":"Misplaced","~":"Tilde"," ":"Space","\t":"Space","\r":"Space","\n":"Space"," ":"Tilde","{":"OpenBrace","}":"CloseBrace","`":"OpenQuote","'":"CloseQuote"},o.TextMacrosMethods),new n.CommandMap("text-macros",{"(":"Math",$:"SelfQuote",_:"SelfQuote","%":"SelfQuote","{":"SelfQuote","}":"SelfQuote"," ":"SelfQuote","&":"SelfQuote","#":"SelfQuote","\\":"SelfQuote","'":["Accent","´"],"’":["Accent","´"],"`":["Accent","`"],"‘":["Accent","`"],"^":["Accent","^"],'"':["Accent","¨"],"~":["Accent","~"],"=":["Accent","¯"],".":["Accent","˙"],u:["Accent","˘"],v:["Accent","ˇ"],emph:"Emph",rm:["SetFont",r.TexConstant.Variant.NORMAL],mit:["SetFont",r.TexConstant.Variant.ITALIC],oldstyle:["SetFont",r.TexConstant.Variant.OLDSTYLE],cal:["SetFont",r.TexConstant.Variant.CALLIGRAPHIC],it:["SetFont","-tex-mathit"],bf:["SetFont",r.TexConstant.Variant.BOLD],bbFont:["SetFont",r.TexConstant.Variant.DOUBLESTRUCK],scr:["SetFont",r.TexConstant.Variant.SCRIPT],frak:["SetFont",r.TexConstant.Variant.FRAKTUR],sf:["SetFont",r.TexConstant.Variant.SANSSERIF],tt:["SetFont",r.TexConstant.Variant.MONOSPACE],tiny:["SetSize",.5],Tiny:["SetSize",.6],scriptsize:["SetSize",.7],small:["SetSize",.85],normalsize:["SetSize",1],large:["SetSize",1.2],Large:["SetSize",1.44],LARGE:["SetSize",1.73],huge:["SetSize",2.07],Huge:["SetSize",2.49],mathcal:"MathModeOnly",mathscr:"MathModeOnly",mathrm:"MathModeOnly",mathbf:"MathModeOnly",mathbb:"MathModeOnly",mathit:"MathModeOnly",mathfrak:"MathModeOnly",mathsf:"MathModeOnly",mathtt:"MathModeOnly",Bbb:["Macro","{\\bbFont #1}",1],textrm:["Macro","{\\rm #1}",1],textit:["Macro","{\\it #1}",1],textbf:["Macro","{\\bf #1}",1],textsf:["Macro","{\\sf #1}",1],texttt:["Macro","{\\tt #1}",1],dagger:["Insert","†"],ddagger:["Insert","‡"],S:["Insert","§"],",":["Spacer",r.TexConstant.Length.THINMATHSPACE],":":["Spacer",r.TexConstant.Length.MEDIUMMATHSPACE],">":["Spacer",r.TexConstant.Length.MEDIUMMATHSPACE],";":["Spacer",r.TexConstant.Length.THICKMATHSPACE],"!":["Spacer",r.TexConstant.Length.NEGATIVETHINMATHSPACE],enspace:["Spacer",".5em"],quad:["Spacer","1em"],qquad:["Spacer","2em"],thinspace:["Spacer",r.TexConstant.Length.THINMATHSPACE],negthinspace:["Spacer",r.TexConstant.Length.NEGATIVETHINMATHSPACE],hskip:"Hskip",hspace:"Hskip",kern:"Hskip",mskip:"Hskip",mspace:"Hskip",mkern:"Hskip",rule:"rule",Rule:["Rule"],Space:["Rule","blank"],color:"CheckAutoload",textcolor:"CheckAutoload",colorbox:"CheckAutoload",fcolorbox:"CheckAutoload",href:"CheckAutoload",style:"CheckAutoload",class:"CheckAutoload",cssId:"CheckAutoload",unicode:"CheckAutoload",ref:["HandleRef",!1],eqref:["HandleRef",!0]},o.TextMacrosMethods)},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.AbstractSymbolMap=MathJax._.input.tex.SymbolMap.AbstractSymbolMap,e.RegExpMap=MathJax._.input.tex.SymbolMap.RegExpMap,e.AbstractParseMap=MathJax._.input.tex.SymbolMap.AbstractParseMap,e.CharacterMap=MathJax._.input.tex.SymbolMap.CharacterMap,e.DelimiterMap=MathJax._.input.tex.SymbolMap.DelimiterMap,e.MacroMap=MathJax._.input.tex.SymbolMap.MacroMap,e.CommandMap=MathJax._.input.tex.SymbolMap.CommandMap,e.EnvironmentMap=MathJax._.input.tex.SymbolMap.EnvironmentMap},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.TexConstant=MathJax._.input.tex.TexConstants.TexConstant},function(t,e,a){"use strict";a.r(e);var n=a(4),r=a(5),o=a(0),s=a(1);Object(n.combineWithMathJax)({_:{input:{tex:{textmacros:{TextMacrosConfiguration:r,TextMacrosMethods:o,TextParser:s}}}}})}]);