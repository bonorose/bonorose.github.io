(function(e){function n(n){for(var r,a,c=n[0],i=n[1],s=n[2],l=0,m=[];l<c.length;l++)a=c[l],Object.prototype.hasOwnProperty.call(o,a)&&o[a]&&m.push(o[a][0]),o[a]=0;for(r in i)Object.prototype.hasOwnProperty.call(i,r)&&(e[r]=i[r]);d&&d(n);while(m.length)m.shift()();return u.push.apply(u,s||[]),t()}function t(){for(var e,n=0;n<u.length;n++){for(var t=u[n],r=!0,a=1;a<t.length;a++){var c=t[a];0!==o[c]&&(r=!1)}r&&(u.splice(n--,1),e=i(i.s=t[0]))}return e}var r={},a={app:0},o={app:0},u=[];function c(e){return i.p+"js/"+({about:"about"}[e]||e)+"."+{"chunk-31ad39ce":"219ee66b",about:"3d54176b","chunk-676d7a31":"d60b77c3"}[e]+".js"}function i(n){if(r[n])return r[n].exports;var t=r[n]={i:n,l:!1,exports:{}};return e[n].call(t.exports,t,t.exports,i),t.l=!0,t.exports}i.e=function(e){var n=[],t={"chunk-31ad39ce":1,about:1,"chunk-676d7a31":1};a[e]?n.push(a[e]):0!==a[e]&&t[e]&&n.push(a[e]=new Promise((function(n,t){for(var r="css/"+({about:"about"}[e]||e)+"."+{"chunk-31ad39ce":"653c4684",about:"a19eaed1","chunk-676d7a31":"30c45429"}[e]+".css",o=i.p+r,u=document.getElementsByTagName("link"),c=0;c<u.length;c++){var s=u[c],l=s.getAttribute("data-href")||s.getAttribute("href");if("stylesheet"===s.rel&&(l===r||l===o))return n()}var m=document.getElementsByTagName("style");for(c=0;c<m.length;c++){s=m[c],l=s.getAttribute("data-href");if(l===r||l===o)return n()}var d=document.createElement("link");d.rel="stylesheet",d.type="text/css",d.onload=n,d.onerror=function(n){var r=n&&n.target&&n.target.src||o,u=new Error("Loading CSS chunk "+e+" failed.\n("+r+")");u.code="CSS_CHUNK_LOAD_FAILED",u.request=r,delete a[e],d.parentNode.removeChild(d),t(u)},d.href=o;var h=document.getElementsByTagName("head")[0];h.appendChild(d)})).then((function(){a[e]=0})));var r=o[e];if(0!==r)if(r)n.push(r[2]);else{var u=new Promise((function(n,t){r=o[e]=[n,t]}));n.push(r[2]=u);var s,l=document.createElement("script");l.charset="utf-8",l.timeout=120,i.nc&&l.setAttribute("nonce",i.nc),l.src=c(e);var m=new Error;s=function(n){l.onerror=l.onload=null,clearTimeout(d);var t=o[e];if(0!==t){if(t){var r=n&&("load"===n.type?"missing":n.type),a=n&&n.target&&n.target.src;m.message="Loading chunk "+e+" failed.\n("+r+": "+a+")",m.name="ChunkLoadError",m.type=r,m.request=a,t[1](m)}o[e]=void 0}};var d=setTimeout((function(){s({type:"timeout",target:l})}),12e4);l.onerror=l.onload=s,document.head.appendChild(l)}return Promise.all(n)},i.m=e,i.c=r,i.d=function(e,n,t){i.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},i.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,n){if(1&n&&(e=i(e)),8&n)return e;if(4&n&&"object"===typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(i.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var r in e)i.d(t,r,function(n){return e[n]}.bind(null,r));return t},i.n=function(e){var n=e&&e.__esModule?function(){return e["default"]}:function(){return e};return i.d(n,"a",n),n},i.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},i.p="/",i.oe=function(e){throw console.error(e),e};var s=window["webpackJsonp"]=window["webpackJsonp"]||[],l=s.push.bind(s);s.push=n,s=s.slice();for(var m=0;m<s.length;m++)n(s[m]);var d=l;u.push([0,"chunk-vendors"]),t()})({0:function(e,n,t){e.exports=t("56d7")},"56d7":function(e,n,t){"use strict";t.r(n),t.d(n,"serverURL",(function(){return N}));t("e260"),t("e6cf"),t("cca6"),t("a79d");var r=t("bc3a"),a=t.n(r),o=t("2b0e"),u=t("58ca"),c=t("e75b"),i=t.n(c),s=(t("bf68"),function(){var e=this,n=e.$createElement,t=e._self._c||n;return t("v-app",[t("router-view")],1)}),l=[],m={name:"App",data:function(){return{}},mounted:function(){var e=localStorage.getItem("dark_theme");e&&(this.$vuetify.theme.dark="true"==e)}},d=m,h=t("2877"),p=t("6544"),f=t.n(p),b=t("7496"),g=Object(h["a"])(d,s,l,!1,null,null,null),k=g.exports;f()(g,{VApp:b["a"]});t("d3b7"),t("3ca3"),t("ddb0");var v=t("8c4f"),P=t("0e44"),y=t("2f62"),w=t("1da1"),A=(t("96cf"),{user:null}),U={isAuthenticated:function(e){return!!e.user},isAdmin:function(e){if("admin"==e.user.account_type)return!0},stateUser:function(e){return e.user}},_={logIn:function(e,n){return Object(w["a"])(regeneratorRuntime.mark((function t(){var r;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return r=e.dispatch,t.next=3,a.a.post("login",n);case 3:return t.next=5,r("viewMe");case 5:case"end":return t.stop()}}),t)})))()},viewMe:function(e){return Object(w["a"])(regeneratorRuntime.mark((function n(){var t,r,o;return regeneratorRuntime.wrap((function(n){while(1)switch(n.prev=n.next){case 0:return t=e.commit,n.next=3,a.a.get("home");case 3:return r=n.sent,o=r.data,n.next=7,t("setUser",o);case 7:case"end":return n.stop()}}),n)})))()},logOut:function(e){return Object(w["a"])(regeneratorRuntime.mark((function n(){var t,r;return regeneratorRuntime.wrap((function(n){while(1)switch(n.prev=n.next){case 0:t=e.commit,r=null,t("logout",r);case 3:case"end":return n.stop()}}),n)})))()}},O={setUser:function(e,n){e.user=n},logout:function(e,n){e.user=n}},x={state:A,getters:U,actions:_,mutations:O},R={parcels:[{id:0}],currentParcelContainer:null},j={parcelsUser:function(e){return e.parcels},lastParcel:function(e){return e.parcelContainer}},C={proceedParcelDetails:function(e,n){return Object(w["a"])(regeneratorRuntime.mark((function t(){var r;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:r=e.commit,r("setUserParcel",n);case 2:case"end":return t.stop()}}),t)})))()},finishParcel:function(e,n){return Object(w["a"])(regeneratorRuntime.mark((function t(){var r;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:r=e.commit,r("finishUserParcel",n);case 2:case"end":return t.stop()}}),t)})))()},international_finishParcel:function(e,n){return Object(w["a"])(regeneratorRuntime.mark((function t(){var r;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:r=e.commit,r("finishUserInternationalParcel",n);case 2:case"end":return t.stop()}}),t)})))()},payParcels:function(e){return Object(w["a"])(regeneratorRuntime.mark((function n(){var t;return regeneratorRuntime.wrap((function(n){while(1)switch(n.prev=n.next){case 0:t=e.commit,t("payUserParcels");case 2:case"end":return n.stop()}}),n)})))()}},E={setUserParcel:function(e,n){e.currentParcelContainer=n},finishUserParcel:function(e,n){e.currentParcelContainer=n},finishUserInternationalParcel:function(e,n){e.currentParcelContainer=n},payUserParcels:function(e){e.parcels=null,e.currentParcelContainer=null}},S={state:R,getters:j,actions:C,mutations:E};o["a"].use(y["a"]);var T=new y["a"].Store({state:{},mutations:{},actions:{},modules:{users:x,parcels:S},plugins:[Object(P["a"])()]});o["a"].use(v["a"]);var L=[{path:"/",name:"",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"bede"))},beforeEnter:function(e,n,t){var r=e.query.uri;null!=r&&"/"!=r?(t(!1),q.push(r)):t()},children:[{path:"/",name:"Landing",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"be82"))}},{path:"/send",name:"SendParcel",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"80be"))}},{path:"/track",name:"TrackParcel",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"50a9"))}},{path:"/checkout",props:function(e){return{parcel_invoice:e.query.parcel_invoice,phone_number:e.query.phone_number,shipment_type:e.query.shipment_type}},name:"ParcelCheckout",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"7553"))}},{path:"/cookies",name:"CookiesPratka",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"89ba"))}},{path:"/gdpr",name:"GDPRPratka",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"5161"))}},{path:"/terms-of-service",name:"TermsOfService",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"2b7f"))}},{path:"/license-kpc",name:"LicenseKPC",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"353b"))}},{path:"/login",name:"Login",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"e220"))}}]},{path:"/admin",name:"",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"3c19"))},meta:{requiresAdminAuth:!0},children:[{path:"/",name:"AdminHome",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"6966"))}},{path:"/admin/parcels",name:"AdminParcels",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"08cc"))}},{path:"/admin/transaction-history",name:"AdminTransactionHistory",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"e83a"))}}]},{path:"/home",name:"",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"2b49"))},meta:{requiresAuth:!0},children:[{path:"/",name:"UserProfile",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"688b"))}},{path:"/profile/address",name:"UserAddress",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"8394"))}},{path:"/profile/payment",name:"UserPayment",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"eaa0"))}},{path:"/profile/parcel-history",name:"UserParcelHistory",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"4f91"))}},{path:"/user/send-parcels",name:"UserSendParcel",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"eaa0"))}},{path:"/user/track-parcels",name:"UserTrackParcel",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"eaa0"))}},{path:"/user/transaction-history",name:"UserTransactionHistory",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"74fb"))}},{path:"/user/documentation",name:"Documentation",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"2fd5"))},children:[{path:"/user/documentation/setup",name:"InitialSetup",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"533e"))}},{path:"/user/documentation/user-registration",name:"UserRegistration",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"fa96"))}},{path:"/user/documentation/creating-areas",name:"CreatingAreas",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"0d9e"))}},{path:"/user/documentation/creating-groups",name:"CreatingGroups",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"a132"))}},{path:"/user/documentation/adding-new-devices",name:"AddingNewDevices",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("about")]).then(t.bind(null,"6e22"))}}]}]},{path:"*",name:"Page404",component:function(){return Promise.all([t.e("chunk-31ad39ce"),t.e("chunk-676d7a31")]).then(t.bind(null,"9601"))}}],q=new v["a"]({mode:"history",base:"/",routes:L,scrollBehavior:function(e,n,t){return e.hash?{selector:e.hash,behavior:"smooth"}:t||{x:0,y:0,behavior:"smooth"}}});q.beforeEach((function(e,n,t){if(e.matched.some((function(e){return e.meta.requiresAuth}))&&T.getters.isAuthenticated)t();else if(e.matched.some((function(e){return e.meta.requiresAdminAuth}))){if(T.getters.isAdmin)return void t();t("/admin/")}else t()}));var D=q,H=t("f309"),M=t("fcf4");o["a"].use(H["a"]);var B=new H["a"]({theme:{themes:{light:{primary:"#D70002",secondary:"#FBD53D",third:M["a"].grey.lighten3,accent:"#3692b6",text:"#1F506F",background:"#ffffff",error:M["a"].red.accent4,warning:M["a"].amber.darken2,info:M["a"].grey.darken1,success:M["a"].green.darken1},dark:{primary:"#ffffff",secondary:"#101010",accent:"#1F506F",text:"#ffffff",background:"#151515",error:M["a"].red.accent4,warning:M["a"].amber.darken4,info:M["a"].grey.darken3,success:M["a"].green.darken3}},dark:!1}}),F=t("0284"),I=t.n(F),N="VUE_APP_SERVER_URL";a.a.defaults.withCredentials=!0,a.a.defaults.baseURL="https://www.pratkabg.com/api/",o["a"].config.productionTip=!1,o["a"].use(u["a"]),o["a"].use(i.a),o["a"].use(I.a,{id:"G-H5MWEZBJHC",router:D}),a.a.interceptors.response.use(void 0,(function(e){if(e){var n=e.config;if(401===e.response.status&&!n._retry)return n._retry=!0,T.dispatch("logOut"),D.push("/")}})),new o["a"]({router:D,store:T,vuetify:B,render:function(e){return e(k)}}).$mount("#app")}});
//# sourceMappingURL=app.227f356b.js.map