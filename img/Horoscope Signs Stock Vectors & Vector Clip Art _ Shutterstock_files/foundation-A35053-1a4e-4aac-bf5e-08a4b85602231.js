if(typeof IRF==="undefined"){IRF={iraid:"35053",irauuid:"A35053-1a4e-4aac-bf5e-08a4b85602231",ircdn:{p:"d3cxv97fi8q177.cloudfront.net",d:"tagmgmt.impactradius.com"},irlogd:{p:"tl.r7ls.net",d:"tagmgmt.impactradius.com"},irfv:"ir_data_layer.",irdv:13,sdc:[{id:3,n:"www.Shutterstock.com",u:"/foundation-tags-SD3-3ed6-412c-8abc-bf8415e204121.js",zu:"/foundation-tags-SD3-3ed6-412c-8abc-bf8415e204121.min.js",c:0,s:"(?:(?:.*?\\.shutterstock\\.com))",eo:1,cr:0,dw:0,hp:1}]};
IRF.util={clearCookie:function(name,path,domain){var x=name+"=deleted; expires="+new Date(0).toUTCString();
if(path){x+="; path="+escape(path)}else{x+="; path=/"}if(domain){x+="; domain="+escape(domain)
}document.cookie=x},widestCookieDomain:function(){var pageDomain=document.location.host.split(".").reverse(),i,cookieName="IRF_cd",cookieDomain=pageDomain[0],cookieVal;
if(cookieDomain=="localhost"){return""}for(i=1;i<pageDomain.length;i++){cookieDomain=pageDomain[i]+"."+cookieDomain;
this.setCookie(cookieName,cookieDomain,1,cookieDomain,"/");cookieVal=this.getCookie(cookieName);
if(cookieVal===cookieDomain){break}}this.clearCookie(cookieName,"/",cookieDomain);
return cookieDomain},strContains:function(str,sstr){return str&&sstr&&str.indexOf(sstr)!=-1
},hasValue:function(value){return value!==null&&value!==undefined},isEmpty:function(value){return !IRF.util.hasValue(value)||value===""
},isEmptyOrZero:function(value){return IRF.util.isEmpty(value)||value===0},getQueryParam:function(p){var url=window.location.search,match;
if(window.location.href.indexOf("#")!==-1){url+="&"+window.location.href.split("#")[1]
}match=new RegExp("[?&]"+p+"=([^&]*)","i").exec(url);return match?IRF.util.safeDecodeURIComponent(match[1].replace(/\+/g," ")):null
},hasValue:function(value){return value!==null&&value!==undefined},addListener:function(el,ev,fn){if(el){if(el.attachEvent){el.attachEvent("on"+ev,function(){fn.call(el)
})}else{el.addEventListener(ev,fn,false)}}},removeListener:function(el,ev,fn){if(el.removeEventListener){el.removeEventListener(ev,fn,false)
}if(el.detachEvent){el.detachEvent("on"+ev,fn)}},setCookie:function(n,v,days,domain,path){var cValue=n+"="+encodeURIComponent(v),exdate;
if(days){exdate=new Date();exdate.setDate(exdate.getDate()+days);cValue+="; expires="+exdate.toUTCString()
}if(path){cValue+="; path="+encodeURIComponent(path)}else{cValue+="; path=/"}if(domain){cValue+="; domain="+encodeURIComponent(domain)
}document.cookie=cValue},getCookie:function(n){var cks=document.cookie.split(";"),len=cks.length,x,a,b;
for(x=0;x<len;x++){a=cks[x].substr(0,cks[x].indexOf("="));b=cks[x].substr(cks[x].indexOf("=")+1);
a=a.replace(/^\s+|\s+$/g,"");if(a==n){return IRF.util.safeDecodeURIComponent(b)}}},isPaymentSite:function(){var pdomains=/\b(paypal|billmelater|worldpay|authorize)\b/;
return pdomains.test(document.referrer.replace(/^https?:\/\/([^\/]+)\/.*$/,"$1"))
},logErrors:function(loc,evt,msg){try{var img=document.createElement("img"),src="https://logs-01.loggly.com/inputs/9b965af4-52fb-46fa-be1b-8dc5fb0aad05/tag/jsinsight/1*1.gif?",agent=navigator&&navigator.userAgent?navigator.userAgent:"unavailable";
src+="type="+loc+"&msg="+encodeURIComponent(msg)+"&event="+evt+"&agent="+encodeURIComponent(agent);
img.src=src;img.width=img.height=img.border=0;img.style.position="absolute";img.style.visibility="hidden";
document.body.appendChild(img)}catch(e){}},onDomReady:function(onLoad){var isTop,testDiv,scrollIntervalId,isBrowser=typeof window!=="undefined"&&window.document,isPageLoaded=!isBrowser,doc=isBrowser?document:null,readyCalls=[];
function runCallbacks(callbacks){var i;for(i=0;i<callbacks.length;i+=1){callbacks[i](doc)
}}function callReady(){var callbacks=readyCalls;if(isPageLoaded){if(callbacks.length){readyCalls=[];
runCallbacks(callbacks)}}}function pageLoaded(){if(document.body){if(!isPageLoaded){isPageLoaded=true;
if(scrollIntervalId){clearInterval(scrollIntervalId)}callReady()}}else{setTimeout(pageLoaded,30)
}}if(isBrowser){if(document.addEventListener){document.addEventListener("DOMContentLoaded",pageLoaded,false);
window.addEventListener("load",pageLoaded,false)}else{if(window.attachEvent){window.attachEvent("onload",pageLoaded);
testDiv=document.createElement("div");try{isTop=window.frameElement===null}catch(e){}if(testDiv.doScroll&&isTop&&window.external){scrollIntervalId=setInterval(function(){try{testDiv.doScroll();
pageLoaded()}catch(e){}},30)}}}if(document.readyState==="complete"){pageLoaded()}}if(isPageLoaded){onLoad(doc)
}else{readyCalls.push(onLoad)}},safeDecodeURIComponent:function(s){if(s){s=s.replace(/%([EF][0-9A-F])%([89AB][0-9A-F])%([89AB][0-9A-F])/gi,function(code,hex1,hex2,hex3){var n1=parseInt(hex1,16)-224;
var n2=parseInt(hex2,16)-128;if(n1==0&&n2<32){return code}var n3=parseInt(hex3,16)-128;
var n=(n1<<12)+(n2<<6)+n3;if(n>65535){return code}return String.fromCharCode(n)});
s=s.replace(/%([CD][0-9A-F])%([89AB][0-9A-F])/gi,function(code,hex1,hex2){var n1=parseInt(hex1,16)-192;
if(n1<2){return code}var n2=parseInt(hex2,16)-128;return String.fromCharCode((n1<<6)+n2)
});s=s.replace(/%([0-7][0-9A-F])/gi,function(code,hex){return String.fromCharCode(parseInt(hex,16))
})}return s}};(function(){IRF.csdc=null;for(var x=0,xx=IRF.sdc.length;x<xx;x++){if(new RegExp(IRF.sdc[x].s).test(document.URL)){IRF.csdc=IRF.sdc[x];
IRF.deploymentId=IRF.sdc[x].id;break}}})();IRF.consoleLog=function(){if(IRF.page&&IRF.page.debug&&typeof console!="undefined"&&console&&console.log){var args=[],x=0,xx=arguments.length;
for(;x<xx;x++){args[x]=arguments[x]}console.log(new Date().toTimeString()+" - "+args[0],args.slice(1,args.length))
}};IRF.now=function(){return new Date().getTime()};IRF.startTime=IRF.now();IRF.cookieExpiryForever=365;
IRF.JSON={};(function(){var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;
function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];
return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)
})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];
if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);
case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);
case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;
for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";
gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;
i+=1){if(typeof rep[i]==="string"){k=rep[i];v=str(k,value);if(v){partial.push(k+(gap?": ":":")+v)
}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);
if(v){partial.push(k+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";
gap=mind;return v}}IRF.JSON.stringify=function(value,replacer,space){var i;gap="";
indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else{if(typeof space==="string"){indent=space
}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){IRF.consoleLog("IRF.JSON.stringify error")
}return str("",{"":value})};IRF.JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];
if(value&&typeof value==="object"){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);
if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)
}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)
})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,":").replace(/\w+\s*\:/g,":"))){j=eval("("+text+")");
return typeof reviver==="function"?walk({"":j},""):j}IRF.consoleLog("IRF.JSON.parse error")
}}());IRF.page=(function(){var page,cookie,cookieSettable=IRF.util.hasValue(IRF.deploymentId),cookieName="IRF_"+IRF.deploymentId,now=IRF.startTime;
function sessionTimeout(){var lastActivity,timeout=30*60*1000,age,ret=true;lastActivity=cookie.a;
if(lastActivity){lastActivity=parseInt(lastActivity,10);age=now-lastActivity;if(age<=timeout){ret=false
}}cookie.a=now;return ret}function limitCharacters(str,num){return str.substring(0,num)
}function migrateCookie(cookie){if(!cookie.user){cookie.user={time:0,ref:null,pv:0,cap:{},v:{}}
}if(!cookie.user.v){cookie.user.v={}}if(!cookie.visit){cookie.visit={time:0,ref:null,pv:0,cap:{},v:{}}
}if(!cookie.visit.v){cookie.visit.v={}}if(cookie.referrer){delete cookie.referrer
}if(cookie.ucap){cookie.user.cap=cookie.ucap;delete cookie.ucap}if(cookie.vcap){cookie.visit.cap=cookie.vcap;
delete cookie.vcap}if(cookie.userPageViews){cookie.user.pv=cookie.userPageViews;delete cookie.userPageViews
}if(cookie.visitPageViews){cookie.visit.pv=cookie.visitPageViews;delete cookie.visitPageViews
}if(cookie.sessionLandingPage){cookie.lp=limitCharacters(cookie.sessionLandingPage,100);
delete cookie.sessionLandingPage}if(cookie.sc){cookie.visits=Math.max(cookie.visits,cookie.sc);
delete cookie.sc}if(cookie.pvar){delete cookie.pvar}return cookie}function cleanCookies(){var i,name,cookies=document.cookie.split("; "),clear=/^(IRF_(undefined|activity)|IRT_(visits|activity|[0-9]+))=/;
for(i=0;i<cookies.length;i++){if(clear.test(cookies[i])){name=cookies[i].split("=")[0];
IRF.util.clearCookie(name,"");IRF.util.clearCookie(name,"/")}}}function saveCookie(){if(!cookie.d&&IRF.csdc&&!IRF.csdc.cr){IRF.util.clearCookie(cookieName,"/");
cookie.d=IRF.util.widestCookieDomain()}if(cookieSettable){IRF.util.setCookie(cookieName,IRF.JSON.stringify(cookie),IRF.cookieExpiryForever,cookie.d)
}}function createNewCookie(){return{visits:0,user:{time:0,ref:null,pv:0,cap:{},v:{}},visit:{time:0,ref:null,pv:0,cap:{},v:{}},lp:null,debug:0}
}cookie=IRF.util.getCookie(cookieName);if(cookie){try{cookie=IRF.JSON.parse(cookie);
cookie=migrateCookie(cookie)}catch(e){IRF.util.clearCookie(cookieName);cookie=createNewCookie()
}}else{cookie=createNewCookie()}function getReferrer(){return document.referrer?document.referrer:"direct"
}function isExternalReferrerChanged(){if(IRF.util.isPaymentSite()){return false}var hp=/:\/\/(.*?)\//,r,v,s;
if(document.referrer){r=hp.exec(document.referrer);v=hp.exec(cookie.lp);if(r&&v&&r[1]!=v[1]){s=hp.exec(cookie.visit.ref);
return !s||r[1]!=s[1]}}return false}var ckeQp=IRF.util.getQueryParam("IRF_test");
if(ckeQp&&(ckeQp=="1"||ckeQp=="2")){cookie.debug=parseInt(ckeQp,10)}if(sessionTimeout()||isExternalReferrerChanged()){cleanCookies();
cookie.visit={time:now,ref:limitCharacters(getReferrer(),400),pv:0,cap:{},v:{}};cookie.lp=limitCharacters(document.URL,100);
cookie.visits++;if(!cookie.user.time){cookie.user={time:cookie.visit.time,ref:cookie.visit.ref,pv:0,cap:{},v:{}}
}}cookie.visit.pv++;cookie.user.pv++;page={};page.start=now;page.debug=cookie.debug;
saveCookie();page.setVariable=function(name,value,expiry){var scope=expiry?"visit":"user";
if(value===null||value===undefined){delete cookie[scope].v[name]}else{cookie[scope].v[name]=value
}saveCookie()};page.getCookie=IRF.util.getCookie;page.getVariable=function(name){var v=cookie.visit.v[name];
if(v===undefined){v=cookie.user.v[name]}return v};page.setDebugMode=function(enable){page.debug=cookie.debug=enable;
saveCookie()};page.setUserReferrer=function(r){cookie.user.ref=r;saveCookie()};page.setVisitReferrer=function(r){cookie.visit.ref=r;
saveCookie()};page.setVisitLandingPage=function(lp){cookie.lp=lp;saveCookie()};page.clearFrequencyCaps=function(){cookie.user.cap=cookie.visit.cap={};
saveCookie()};page.on=IRF.util.addListener;page.getUrlParameter=IRF.util.getQueryParam;
page.startOfVisit=function(){return cookie.visit.time};page.getPathElement=function(i){var arr;
if(i===0){return window.location.pathname}arr=window.location.pathname.split("/");
if(i<0){i+=arr.length}if(i<0||i>=arr.length){return null}return arr[i]};page.getReferrer=function(i){if(i===0){return cookie.user.ref
}else{return cookie.visit.ref}};page.getVisitNo=function(){return cookie.visits};
page.getVisitPageCount=function(){return cookie.visit.pv};page.getUserPageCount=function(){return cookie.user.pv
};page.getVisitLandingPage=function(){return cookie.lp};function getTagViewCount(tagId,obj){var c;
if(!obj.cap){obj.cap={}}c=obj.cap[tagId];return c?c:0}page.getTagViewCountForUser=function(tagId){return getTagViewCount(tagId,cookie.user)
};page.getTagViewCountForVisit=function(tagId){return getTagViewCount(tagId,cookie.visit)
};function incrementTagViewCount(tagId,obj){var c=getTagViewCount(tagId,obj);obj.cap[tagId]=c+1;
saveCookie()}page.incrementTagViewCountForVisit=function(tagId){incrementTagViewCount(tagId,cookie.visit)
};page.incrementTagViewCountForUser=function(tagId){incrementTagViewCount(tagId,cookie.user)
};return page})();IRF.addLoadListener=function(el,fn){if(fn){if(el.readyState&&el.onload!==null){el.onreadystatechange=function(){if(el.readyState==="loaded"||el.readyState==="complete"){el.onreadystatechange=el.onerror=null;
fn()}}}else{el.onload=fn}}};IRF.createScript=function(url,async,type,id){var el=document.createElement("script");
el.src=url;if(id){el.id=id}if(async){el.async="async";el.defer="defer"}el.type="text/javascript";
return el};IRF.createTag=function(url,async,type,fn,id){var el=IRF.createScript(url,async,type,id);
IRF.addLoadListener(el,fn);return el};(function(){function setReady(){IRF.domReady=true
}if(document.addEventListener){if((navigator.userAgent.indexOf("AppleWebKit/")>-1)){var timer=window.setInterval(function(){if(/loaded|complete/.test(document.readyState)){clearInterval(timer);
setReady()}},30)}else{if(/interactive|loaded|complete/.test(document.readyState)){setReady()
}else{document.addEventListener("DOMContentLoaded",setReady,false)}}}else{setTimeout(function(){var d=window.document;
(function(){try{if(!document.body){throw"continue"}d.documentElement.doScroll("left")
}catch(e){setTimeout(arguments.callee,30);return}setReady()})()},30)}})();(function(){function tagLoad(src,id,fn){var existingTag=document.getElementById(id);
if(src&&!existingTag){var first=document.getElementsByTagName("script")[0];first.parentNode.insertBefore(IRF.createTag(src,true,null,fn,id),first)
}}IRF.showPendingTags=IRF.page.debug==2;IRF.cdn=IRF.showPendingTags?IRF.ircdn.d:IRF.ircdn.p;
function loadDebug(){if(IRF.page.debug){tagLoad("//"+IRF.ircdn.p+"/debug-functions_v"+IRF.irdv+".js","irfDebugScript")
}}if(IRF.csdc!==null){var outer=document.getElementById("irfOuterTag"),srcFile=IRF.csdc.u;
if(outer&&(outer.src.indexOf(".gz")>-1||outer.src.indexOf(".min.js")>-1)){srcFile=IRF.csdc.zu
}tagLoad("//"+IRF.cdn+srcFile,null,loadDebug)}else{if(IRF.page.debug){tagLoad("//"+IRF.cdn+"/foundation-"+IRF.irauuid+".js","irfUndeployedOuterTag",loadDebug)
}}})()};