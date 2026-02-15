__d(function(g,r,i,a,m,e,d){Object.defineProperty(e,"__esModule",{value:!0}),Object.keys(r(d[0])).forEach(function(n){"default"!==n&&"__esModule"!==n&&(n in e&&e[n]===r(d[0])[n]||Object.defineProperty(e,n,{enumerable:!0,get:function(){return r(d[0])[n]}}))})},2380,[2395]);
__d(function(g,r,i,a,m,_e,d){Object.defineProperty(_e,"__esModule",{value:!0}),_e.getAnalytics=function getAnalytics(t=(0,r(d[3]).getApp)()){t=(0,r(d[2]).getModularInstance)(t);const n=(0,r(d[3])._getProvider)(t,e);if(n.isInitialized())return n.getImmediate();return initializeAnalytics(t)},_e.getGoogleAnalyticsClientId=async function getGoogleAnalyticsClientId(e){return e=(0,r(d[2]).getModularInstance)(e),async function internalGetGoogleAnalyticsClientId(e,t){const n=await t;return new Promise((t,s)=>{e("get",n,"client_id",e=>{e||s(o.create("no-client-id")),t(e)})})}(w,u[e.app.options.appId])},_e.initializeAnalytics=initializeAnalytics,_e.isSupported=async function isSupported(){if((0,r(d[2]).isBrowserExtension)())return!1;if(!(0,r(d[2]).areCookiesEnabled)())return!1;if(!(0,r(d[2]).isIndexedDBAvailable)())return!1;try{return await(0,r(d[2]).validateIndexedDBOpenable)()}catch(e){return!1}},_e.logEvent=logEvent,_e.setAnalyticsCollectionEnabled=function setAnalyticsCollectionEnabled(e,t){e=(0,r(d[2]).getModularInstance)(e),async function setAnalyticsCollectionEnabled$1(e,t){const n=await e;window[`ga-disable-${n}`]=!t}(u[e.app.options.appId],t).catch(e=>n.error(e))},_e.setConsent=function setConsent(e){w?w("consent","update",e):_setConsentDefaultForInit(e)},_e.setCurrentScreen=function setCurrentScreen(e,t,s){e=(0,r(d[2]).getModularInstance)(e),async function setCurrentScreen$1(e,t,n,s){if(s&&s.global)return e("set",{screen_name:n}),Promise.resolve();e("config",await t,{update:!0,screen_name:n})}(w,u[e.app.options.appId],t,s).catch(e=>n.error(e))},_e.setDefaultEventParameters=function setDefaultEventParameters(e){w?w("set",e):_setDefaultEventParametersForInit(e)},_e.setUserId=function setUserId(e,t,s){e=(0,r(d[2]).getModularInstance)(e),async function setUserId$1(e,t,n,s){if(s&&s.global)return e("set",{user_id:n}),Promise.resolve();e("config",await t,{update:!0,user_id:n})}(w,u[e.app.options.appId],t,s).catch(e=>n.error(e))},_e.setUserProperties=setUserProperties,_e.settings=function settings(e){if(v)throw o.create("already-initialized");e.dataLayerName&&(I=e.dataLayerName);e.gtagName&&(b=e.gtagName)},r(d[0]);
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
const e="analytics",t="https://www.googletagmanager.com/gtag/js",n=new(r(d[1]).Logger)("@firebase/analytics"),s={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},o=new(r(d[2]).ErrorFactory)("analytics","Analytics",s);
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
function createGtagTrustedTypesScriptURL(e){if(!e.startsWith(t)){const t=o.create("invalid-gtag-resource",{gtagURL:e});return n.warn(t.message),""}return e}function promiseAllSettled(e){return Promise.all(e.map(e=>e.catch(e=>e)))}function insertScriptTag(e,n){const s=function createTrustedTypesPolicy(e,t){let n;return window.trustedTypes&&(n=window.trustedTypes.createPolicy(e,t)),n}("firebase-js-sdk-policy",{createScriptURL:createGtagTrustedTypesScriptURL}),o=document.createElement("script"),c=`${t}?l=${e}&id=${n}`;o.src=s?s?.createScriptURL(c):c,o.async=!0,document.head.appendChild(o)}function wrapGtag(e,t,s,o){return async function gtagWrapper(c,...l){try{if("event"===c){const[o,c]=l;await async function gtagOnEvent(e,t,s,o,c){try{let n=[];if(c&&c.send_to){let e=c.send_to;Array.isArray(e)||(e=[e]);const o=await promiseAllSettled(s);for(const s of e){const e=o.find(e=>e.measurementId===s),c=e&&t[e.appId];if(!c){n=[];break}n.push(c)}}0===n.length&&(n=Object.values(t)),await Promise.all(n),e("event",o,c||{})}catch(e){n.error(e)}}(e,t,s,o,c)}else if("config"===c){const[c,p]=l;await async function gtagOnConfig(e,t,s,o,c,l){const p=o[c];try{if(p)await t[p];else{const e=(await promiseAllSettled(s)).find(e=>e.measurementId===c);e&&await t[e.appId]}}catch(e){n.error(e)}e("config",c,l)}(e,t,s,o,c,p)}else if("consent"===c){const[t,n]=l;e("consent",t,n)}else if("get"===c){const[t,n,s]=l;e("get",t,n,s)}else if("set"===c){const[t]=l;e("set",t)}else e(c,...l)}catch(e){n.error(e)}}}const c=new class RetryData{constructor(e={},t=1e3){this.throttleMetadata=e,this.intervalMillis=t}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,t){this.throttleMetadata[e]=t}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}};function getHeaders(e){return new Headers({Accept:"application/json","x-goog-api-key":e})}async function fetchDynamicConfigWithRetry(e,t=c,n){const{appId:s,apiKey:l,measurementId:p}=e.options;if(!s)throw o.create("no-app-id");if(!l){if(p)return{measurementId:p,appId:s};throw o.create("no-api-key")}const u=t.getThrottleMetadata(s)||{backoffCount:0,throttleEndTimeMillis:Date.now()},f=new AnalyticsAbortSignal;return setTimeout(async()=>{f.abort()},void 0!==n?n:6e4),attemptFetchDynamicConfigWithRetry({appId:s,apiKey:l,measurementId:p},u,f,t)}async function attemptFetchDynamicConfigWithRetry(e,{throttleEndTimeMillis:t,backoffCount:s},l,p=c){const{appId:u,measurementId:f}=e;try{await function setAbortableTimeout(e,t){return new Promise((n,s)=>{const c=Math.max(t-Date.now(),0),l=setTimeout(n,c);e.addEventListener(()=>{clearTimeout(l),s(o.create("fetch-throttle",{throttleEndTimeMillis:t}))})})}(l,t)}catch(e){if(f)return n.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${f} provided in the "measurementId" field in the local Firebase config. [${e?.message}]`),{appId:u,measurementId:f};throw e}try{const t=await async function fetchDynamicConfig(e){const{appId:t,apiKey:n}=e,s={method:"GET",headers:getHeaders(n)},c="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig".replace("{app-id}",t),l=await fetch(c,s);if(200!==l.status&&304!==l.status){let e="";try{const t=await l.json();t.error?.message&&(e=t.error.message)}catch(e){}throw o.create("config-fetch-failed",{httpStatus:l.status,responseMessage:e})}return l.json()}(e);return p.deleteThrottleMetadata(u),t}catch(t){const o=t;if(!function isRetriableError(e){if(!(e instanceof r(d[2]).FirebaseError&&e.customData))return!1;const t=Number(e.customData.httpStatus);return 429===t||500===t||503===t||504===t}(o)){if(p.deleteThrottleMetadata(u),f)return n.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${f} provided in the "measurementId" field in the local Firebase config. [${o?.message}]`),{appId:u,measurementId:f};throw t}const c=503===Number(o?.customData?.httpStatus)?(0,r(d[2]).calculateBackoffMillis)(s,p.intervalMillis,30):(0,r(d[2]).calculateBackoffMillis)(s,p.intervalMillis),h={throttleEndTimeMillis:Date.now()+c,backoffCount:s+1};return p.setThrottleMetadata(u,h),n.debug(`Calling attemptFetch again in ${c} millis`),attemptFetchDynamicConfigWithRetry(e,h,l,p)}}class AnalyticsAbortSignal{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */let l,p;function _setConsentDefaultForInit(e){p=e}function _setDefaultEventParametersForInit(e){l=e}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */async function _initializeAnalytics(e,s,c,u,f,h,y){const w=fetchDynamicConfigWithRetry(e);w.then(t=>{c[t.measurementId]=t.appId,e.options.measurementId&&t.measurementId!==e.options.measurementId&&n.warn(`The measurement ID in the local Firebase config (${e.options.measurementId}) does not match the measurement ID fetched from the server (${t.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(e=>n.error(e)),s.push(w);const I=async function validateIndexedDB(){if(!(0,r(d[2]).isIndexedDBAvailable)())return n.warn(o.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;try{await(0,r(d[2]).validateIndexedDBOpenable)()}catch(e){return n.warn(o.create("indexeddb-unavailable",{errorInfo:e?.toString()}).message),!1}return!0}().then(e=>e?u.getId():void 0),[b,v]=await Promise.all([w,I]);(function findGtagScriptOnPage(e){const n=window.document.getElementsByTagName("script");for(const s of Object.values(n))if(s.src&&s.src.includes(t)&&s.src.includes(e))return s;return null}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */)(h)||insertScriptTag(h,b.measurementId),p&&(f("consent","default",p),_setConsentDefaultForInit(void 0)),f("js",new Date);const A=y?.config??{};return A.origin="firebase",A.update=!0,null!=v&&(A.firebase_id=v),f("config",b.measurementId,A),l&&(f("set",l),_setDefaultEventParametersForInit(void 0)),b.measurementId}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class AnalyticsService{constructor(e){this.app=e}_delete(){return delete u[this.app.options.appId],Promise.resolve()}}let u={},f=[];const h={};let y,w,I="dataLayer",b="gtag",v=!1;function factory(e,t,s){!function warnOnBrowserContextMismatch(){const e=[];if((0,r(d[2]).isBrowserExtension)()&&e.push("This is a browser extension environment."),(0,r(d[2]).areCookiesEnabled)()||e.push("Cookies are not available."),e.length>0){const t=e.map((e,t)=>`(${t+1}) ${e}`).join(" "),s=o.create("invalid-analytics-context",{errorInfo:t});n.warn(s.message)}}();const c=e.options.appId;if(!c)throw o.create("no-app-id");if(!e.options.apiKey){if(!e.options.measurementId)throw o.create("no-api-key");n.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${e.options.measurementId} provided in the "measurementId" field in the local Firebase config.`)}if(null!=u[c])throw o.create("already-exists",{id:c});if(!v){!function getOrCreateDataLayer(e){let t=[];return Array.isArray(window[e])?t=window[e]:window[e]=t,t}(I);const{wrappedGtag:e,gtagCore:t}=function wrapOrCreateGtag(e,t,n,s,o){let gtagCore=function(...e){window[s].push(arguments)};return window[o]&&"function"==typeof window[o]&&(gtagCore=window[o]),window[o]=wrapGtag(gtagCore,e,t,n),{gtagCore:gtagCore,wrappedGtag:window[o]}}(u,f,h,I,b);w=e,y=t,v=!0}u[c]=_initializeAnalytics(e,f,h,t,y,I,s);return new AnalyticsService(e)}function initializeAnalytics(t,n={}){const s=(0,r(d[3])._getProvider)(t,e);if(s.isInitialized()){const e=s.getImmediate();if((0,r(d[2]).deepEqual)(n,s.getOptions()))return e;throw o.create("already-initialized")}return s.initialize({options:n})}function setUserProperties(e,t,s){e=(0,r(d[2]).getModularInstance)(e),async function setUserProperties$1(e,t,n,s){if(s&&s.global){const t={};for(const e of Object.keys(n))t[`user_properties.${e}`]=n[e];return e("set",t),Promise.resolve()}e("config",await t,{update:!0,user_properties:n})}(w,u[e.app.options.appId],t,s).catch(e=>n.error(e))}function logEvent(e,t,s,o){e=(0,r(d[2]).getModularInstance)(e),async function logEvent$1(e,t,n,s,o){if(o&&o.global)e("event",n,s);else{const o=await t;e("event",n,Object.assign({},s,{send_to:o}))}}(w,u[e.app.options.appId],t,s,o).catch(e=>n.error(e))}const A="@firebase/analytics",D="0.10.19";!function registerAnalytics(){(0,r(d[3])._registerComponent)(new(r(d[4]).Component)(e,(e,{options:t})=>factory(e.getProvider("app").getImmediate(),e.getProvider("installations-internal").getImmediate(),t),"PUBLIC")),(0,r(d[3])._registerComponent)(new(r(d[4]).Component)("analytics-internal",function internalFactory(t){try{const n=t.getProvider(e).getImmediate();return{logEvent:(e,t,s)=>logEvent(n,e,t,s),setUserProperties:(e,t)=>setUserProperties(n,e,t)}}catch(e){throw o.create("interop-component-reg-failed",{reason:e})}},"PRIVATE")),(0,r(d[3]).registerVersion)(A,D),(0,r(d[3]).registerVersion)(A,D,"esm2020")}()},2395,[2396,2119,2120,2122,2123]);