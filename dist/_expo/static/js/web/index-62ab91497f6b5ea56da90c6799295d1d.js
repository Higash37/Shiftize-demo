__d(function(g,r,i,a,m,e,d){Object.defineProperty(e,"__esModule",{value:!0}),Object.keys(r(d[0])).forEach(function(n){"default"!==n&&"__esModule"!==n&&(n in e&&e[n]===r(d[0])[n]||Object.defineProperty(e,n,{enumerable:!0,get:function(){return r(d[0])[n]}}))})},2358,[2374]);
__d(function(g,r,_i,a,m,e,d){Object.defineProperty(e,"__esModule",{value:!0}),e.getPerformance=function getPerformance(t=(0,r(d[4]).getApp)()){t=(0,r(d[1]).getModularInstance)(t);const n=(0,r(d[4])._getProvider)(t,"performance");return n.getImmediate()},e.initializePerformance=function initializePerformance(t,n){t=(0,r(d[1]).getModularInstance)(t);const i=(0,r(d[4])._getProvider)(t,"performance");if(i.isInitialized()){const t=i.getImmediate(),o=i.getOptions();if((0,r(d[1]).deepEqual)(o,n??{}))return t;throw S.create("already initialized")}return i.initialize({options:n})},e.trace=function trace(t,n){return t=(0,r(d[1]).getModularInstance)(t),new Trace(t,n)},r(d[0]);const t="@firebase/performance",n="0.7.9",i=n,o="FB-PERF-TRACE-MEASURE",s="_wt_",c="_fcp",l="_fid",u="_lcp",p="_inp",f="_cls",h="@firebase/performance/config",v="@firebase/performance/configexpire",b="Performance",_={"trace started":"Trace {$traceName} was started before.","trace stopped":"Trace {$traceName} is not running.","nonpositive trace startTime":"Trace {$traceName} startTime should be positive.","nonpositive trace duration":"Trace {$traceName} duration should be positive.","no window":"Window is not available.","no app id":"App id is not available.","no project id":"Project id is not available.","no api key":"Api key is not available.","invalid cc log":"Attempted to queue invalid cc event","FB not default":"Performance can only start when Firebase app instance is the default one.","RC response not ok":"RC response is not ok","invalid attribute name":"Attribute name {$attributeName} is invalid.","invalid attribute value":"Attribute value {$attributeValue} is invalid.","invalid custom metric name":"Custom metric name {$customMetricName} is invalid","invalid String merger input":"Input for String merger is invalid, contact support team to resolve.","already initialized":"initializePerformance() has already been called with different options. To avoid this error, call initializePerformance() with the same options as when it was originally called, or call getPerformance() to return the already initialized instance."},S=new(r(d[1]).ErrorFactory)("performance",b,_),T=new(r(d[2]).Logger)(b);
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
   */
let I,y,E,A;T.logLevel=r(d[2]).LogLevel.INFO;class Api{constructor(t){if(this.window=t,!t)throw S.create("no window");this.performance=t.performance,this.PerformanceObserver=t.PerformanceObserver,this.windowLocation=t.location,this.navigator=t.navigator,this.document=t.document,this.navigator&&this.navigator.cookieEnabled&&(this.localStorage=t.localStorage),t.perfMetrics&&t.perfMetrics.onFirstInputDelay&&(this.onFirstInputDelay=t.perfMetrics.onFirstInputDelay),this.onLCP=r(d[3]).onLCP,this.onINP=r(d[3]).onINP,this.onCLS=r(d[3]).onCLS}getUrl(){return this.windowLocation.href.split("?")[0]}mark(t){this.performance&&this.performance.mark&&this.performance.mark(t)}measure(t,n,i){this.performance&&this.performance.measure&&this.performance.measure(t,n,i)}getEntriesByType(t){return this.performance&&this.performance.getEntriesByType?this.performance.getEntriesByType(t):[]}getEntriesByName(t){return this.performance&&this.performance.getEntriesByName?this.performance.getEntriesByName(t):[]}getTimeOrigin(){return this.performance&&(this.performance.timeOrigin||this.performance.timing.navigationStart)}requiredApisAvailable(){return fetch&&Promise&&(0,r(d[1]).areCookiesEnabled)()?!!(0,r(d[1]).isIndexedDBAvailable)()||(T.info("IndexedDB is not supported by current browser"),!1):(T.info("Firebase Performance cannot start if browser does not support fetch and Promise or cookie is disabled."),!1)}setupObserver(t,n){if(!this.PerformanceObserver)return;new this.PerformanceObserver(t=>{for(const i of t.getEntries())n(i)}).observe({entryTypes:[t]})}static getInstance(){return void 0===I&&(I=new Api(y)),I}}function getIid(){return E}
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
   */
function mergeStrings(t,n){const i=t.length-n.length;if(i<0||i>1)throw S.create("invalid String merger input");const o=[];for(let i=0;i<t.length;i++)o.push(t.charAt(i)),n.length>i&&o.push(n.charAt(i));return o.join("")}
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
   */class SettingsService{constructor(){this.instrumentationEnabled=!0,this.dataCollectionEnabled=!0,this.loggingEnabled=!1,this.tracesSamplingRate=1,this.networkRequestsSamplingRate=1,this.logEndPointUrl="https://firebaselogging.googleapis.com/v0cc/log?format=json_proto",this.flTransportEndpointUrl=mergeStrings("hts/frbslgigp.ogepscmv/ieo/eaylg","tp:/ieaeogn-agolai.o/1frlglgc/o"),this.transportKey=mergeStrings("AzSC8r6ReiGqFMyfvgow","Iayx0u-XT3vksVM-pIV"),this.logSource=462,this.logTraceAfterSampling=!1,this.logNetworkAfterSampling=!1,this.configTimeToLive=12,this.logMaxFlushSize=40}getFlTransportFullUrl(){return this.flTransportEndpointUrl.concat("?key=",this.transportKey)}static getInstance(){return void 0===A&&(A=new SettingsService),A}}
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
   */var w;!function(t){t[t.UNKNOWN=0]="UNKNOWN",t[t.VISIBLE=1]="VISIBLE",t[t.HIDDEN=2]="HIDDEN"}(w||(w={}));const M=["firebase_","google_","ga_"],P=new RegExp("^[a-zA-Z]\\w*$");function getServiceWorkerStatus(){const t=Api.getInstance().navigator;return t?.serviceWorker?t.serviceWorker.controller?2:3:1}function getVisibilityState(){switch(Api.getInstance().document.visibilityState){case"visible":return w.VISIBLE;case"hidden":return w.HIDDEN;default:return w.UNKNOWN}}function getEffectiveConnectionType(){const t=Api.getInstance().navigator.connection;switch(t&&t.effectiveType){case"slow-2g":return 1;case"2g":return 2;case"3g":return 3;case"4g":return 4;default:return 0}}
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
   */
function getAppId(t){const n=t.options?.appId;if(!n)throw S.create("no app id");return n}
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
   */
const N="0.0.1",k={loggingEnabled:!0},C="FIREBASE_INSTALLATIONS_AUTH";function getConfig(t,n){const o=function getStoredConfig(){const t=Api.getInstance().localStorage;if(!t)return;const n=t.getItem(v);if(!n||!function configValid(t){return Number(t)>Date.now()}(n))return;const i=t.getItem(h);if(!i)return;try{return JSON.parse(i)}catch{return}}();return o?(processConfig(o),Promise.resolve()):function getRemoteConfig(t,n){return function getAuthTokenPromise(t){const n=t.getToken();return n.then(t=>{}),n}(t.installations).then(o=>{const s=function getProjectId(t){const n=t.options?.projectId;if(!n)throw S.create("no project id");return n}(t.app),c=function getApiKey(t){const n=t.options?.apiKey;if(!n)throw S.create("no api key");return n}(t.app),l=new Request(`https://firebaseremoteconfig.googleapis.com/v1/projects/${s}/namespaces/fireperf:fetch?key=${c}`,{method:"POST",headers:{Authorization:`${C} ${o}`},body:JSON.stringify({app_instance_id:n,app_instance_id_token:o,app_id:getAppId(t.app),app_version:i,sdk_version:N})});return fetch(l).then(t=>{if(t.ok)return t.json();throw S.create("RC response not ok")})}).catch(()=>{T.info(R)})}(t,n).then(processConfig).then(t=>function storeConfig(t){const n=Api.getInstance().localStorage;if(!t||!n)return;n.setItem(h,JSON.stringify(t)),n.setItem(v,String(Date.now()+60*SettingsService.getInstance().configTimeToLive*60*1e3))}(t),()=>{})}const R="Could not fetch config, will use default configs";function processConfig(t){if(!t)return t;const n=SettingsService.getInstance(),i=t.entries||{};return void 0!==i.fpr_enabled?n.loggingEnabled="true"===String(i.fpr_enabled):n.loggingEnabled=k.loggingEnabled,i.fpr_log_source?n.logSource=Number(i.fpr_log_source):k.logSource&&(n.logSource=k.logSource),i.fpr_log_endpoint_url?n.logEndPointUrl=i.fpr_log_endpoint_url:k.logEndPointUrl&&(n.logEndPointUrl=k.logEndPointUrl),i.fpr_log_transport_key?n.transportKey=i.fpr_log_transport_key:k.transportKey&&(n.transportKey=k.transportKey),void 0!==i.fpr_vc_network_request_sampling_rate?n.networkRequestsSamplingRate=Number(i.fpr_vc_network_request_sampling_rate):void 0!==k.networkRequestsSamplingRate&&(n.networkRequestsSamplingRate=k.networkRequestsSamplingRate),void 0!==i.fpr_vc_trace_sampling_rate?n.tracesSamplingRate=Number(i.fpr_vc_trace_sampling_rate):void 0!==k.tracesSamplingRate&&(n.tracesSamplingRate=k.tracesSamplingRate),i.fpr_log_max_flush_size?n.logMaxFlushSize=Number(i.fpr_log_max_flush_size):k.logMaxFlushSize&&(n.logMaxFlushSize=k.logMaxFlushSize),n.logTraceAfterSampling=shouldLogAfterSampling(n.tracesSamplingRate),n.logNetworkAfterSampling=shouldLogAfterSampling(n.networkRequestsSamplingRate),t}function shouldLogAfterSampling(t){return Math.random()<=t}
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
   */let O,U=1;function getInitializationPromise(t){return U=2,O=O||function initializePerf(t){return function getDocumentReadyComplete(){const t=Api.getInstance().document;return new Promise(n=>{if(t&&"complete"!==t.readyState){const handler=()=>{"complete"===t.readyState&&(t.removeEventListener("readystatechange",handler),n())};t.addEventListener("readystatechange",handler)}else n()})}().then(()=>function getIidPromise(t){const n=t.getId();return n.then(t=>{E=t}),n}(t.installations)).then(n=>getConfig(t,n)).then(()=>changeInitializationStatus(),()=>changeInitializationStatus())}(t),O}function changeInitializationStatus(){U=3}
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
   */const L=1e4,z=new TextEncoder;let F,B=3,q=[],D=!1;function processQueue(t){setTimeout(()=>{B<=0||(q.length>0&&function dispatchQueueEvents(){const t=q.splice(0,1e3);(function postToFlEndpoint(t){const n=SettingsService.getInstance().getFlTransportFullUrl();return z.encode(t).length<=65536&&navigator.sendBeacon&&navigator.sendBeacon(n,t)?Promise.resolve():fetch(n,{method:"POST",body:t})})(buildPayload(t)).then(()=>{B=3}).catch(()=>{q=[...t,...q],B--,T.info(`Tries left: ${B}.`),processQueue(L)})}(),processQueue(L))},t)}function buildPayload(t){const n=t.map(t=>({source_extension_json_proto3:t.message,event_time_ms:String(t.eventTime)})),i={request_time_ms:String(Date.now()),client_info:{client_type:1,js_client_info:{}},log_source:SettingsService.getInstance().logSource,log_event:n};return JSON.stringify(i)}function transportHandler(t){return(...n)=>{!function addToQueue(t){if(!t.eventTime||!t.message)throw S.create("invalid cc log");q=[...q,t]}({message:t(...n),eventTime:Date.now()})}}function flushQueuedEvents(){const t=SettingsService.getInstance().getFlTransportFullUrl();for(;q.length>0;){const n=q.splice(-SettingsService.getInstance().logMaxFlushSize),i=buildPayload(n);if(!navigator.sendBeacon||!navigator.sendBeacon(t,i)){q=[...q,...n];break}}if(q.length>0){const n=buildPayload(q);fetch(t,{method:"POST",body:n}).catch(()=>{T.info("Failed flushing queued events.")})}}
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
   */function sendLog(t,n){F||(F={send:transportHandler(serializer),flush:flushQueuedEvents}),F.send(t,n)}function logTrace(t){const n=SettingsService.getInstance();!n.instrumentationEnabled&&t.isAuto||(n.dataCollectionEnabled||t.isAuto)&&Api.getInstance().requiredApisAvailable()&&(!function isPerfInitialized(){return 3===U}()?getInitializationPromise(t.performanceController).then(()=>sendTraceLog(t),()=>sendTraceLog(t)):sendTraceLog(t))}function sendTraceLog(t){if(!getIid())return;const n=SettingsService.getInstance();n.loggingEnabled&&n.logTraceAfterSampling&&sendLog(t,1)}function serializer(t,n){return 0===n?function serializeNetworkRequest(t){const n={url:t.url,http_method:t.httpMethod||0,http_response_code:200,response_payload_bytes:t.responsePayloadBytes,client_start_time_us:t.startTimeUs,time_to_response_initiated_us:t.timeToResponseInitiatedUs,time_to_response_completed_us:t.timeToResponseCompletedUs},i={application_info:getApplicationInfo(t.performanceController.app),network_request_metric:n};return JSON.stringify(i)}(t):function serializeTrace(t){const n={name:t.name,is_auto:t.isAuto,client_start_time_us:t.startTimeUs,duration_us:t.durationUs};0!==Object.keys(t.counters).length&&(n.counters=t.counters);const i=t.getAttributes();0!==Object.keys(i).length&&(n.custom_attributes=i);const o={application_info:getApplicationInfo(t.performanceController.app),trace_metric:n};return JSON.stringify(o)}(t)}function getApplicationInfo(t){return{google_app_id:getAppId(t),app_instance_id:getIid(),web_app_info:{sdk_version:i,page_url:Api.getInstance().getUrl(),service_worker_status:getServiceWorkerStatus(),visibility_state:getVisibilityState(),effective_connection_type:getEffectiveConnectionType()},application_process_state:0}}
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
   */function createNetworkRequestEntry(t,n){const i=n;if(!i||void 0===i.responseStart)return;const o=Api.getInstance().getTimeOrigin(),s=Math.floor(1e3*(i.startTime+o)),c=i.responseStart?Math.floor(1e3*(i.responseStart-i.startTime)):void 0,l=Math.floor(1e3*(i.responseEnd-i.startTime));!function logNetworkRequest(t){const n=SettingsService.getInstance();if(!n.instrumentationEnabled)return;const i=t.url,o=n.logEndPointUrl.split("?")[0],s=n.flTransportEndpointUrl.split("?")[0];i!==o&&i!==s&&n.loggingEnabled&&n.logNetworkAfterSampling&&sendLog(t,0)}({performanceController:t,url:i.name&&i.name.split("?")[0],responsePayloadBytes:i.transferSize,startTimeUs:s,timeToResponseInitiatedUs:c,timeToResponseCompletedUs:l})}
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
   */const $=["_fp",c,l,u,f,p];
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
   */
class Trace{constructor(t,n,i=!1,s){this.performanceController=t,this.name=n,this.isAuto=i,this.state=1,this.customAttributes={},this.counters={},this.api=Api.getInstance(),this.randomId=Math.floor(1e6*Math.random()),this.isAuto||(this.traceStartMark=`FB-PERF-TRACE-START-${this.randomId}-${this.name}`,this.traceStopMark=`FB-PERF-TRACE-STOP-${this.randomId}-${this.name}`,this.traceMeasure=s||`${o}-${this.randomId}-${this.name}`,s&&this.calculateTraceMetrics())}start(){if(1!==this.state)throw S.create("trace started",{traceName:this.name});this.api.mark(this.traceStartMark),this.state=2}stop(){if(2!==this.state)throw S.create("trace stopped",{traceName:this.name});this.state=3,this.api.mark(this.traceStopMark),this.api.measure(this.traceMeasure,this.traceStartMark,this.traceStopMark),this.calculateTraceMetrics(),logTrace(this)}record(t,n,i){if(t<=0)throw S.create("nonpositive trace startTime",{traceName:this.name});if(n<=0)throw S.create("nonpositive trace duration",{traceName:this.name});if(this.durationUs=Math.floor(1e3*n),this.startTimeUs=Math.floor(1e3*t),i&&i.attributes&&(this.customAttributes=Object.assign({},i.attributes)),i&&i.metrics)for(const t of Object.keys(i.metrics))isNaN(Number(i.metrics[t]))||(this.counters[t]=Math.floor(Number(i.metrics[t])));logTrace(this)}incrementMetric(t,n=1){void 0===this.counters[t]?this.putMetric(t,n):this.putMetric(t,this.counters[t]+n)}putMetric(t,n){if(!function isValidMetricName(t,n){return!(0===t.length||t.length>100)&&(n&&n.startsWith(s)&&$.indexOf(t)>-1||!t.startsWith("_"))}(t,this.name))throw S.create("invalid custom metric name",{customMetricName:t});this.counters[t]=function convertMetricValueToInteger(t){const n=Math.floor(t);return n<t&&T.info(`Metric value should be an Integer, setting the value as : ${n}.`),n}(n??0)}getMetric(t){return this.counters[t]||0}putAttribute(t,n){const i=function isValidCustomAttributeName(t){return!(0===t.length||t.length>40)&&(!M.some(n=>t.startsWith(n))&&!!t.match(P))}(t),o=function isValidCustomAttributeValue(t){return 0!==t.length&&t.length<=100}(n);if(i&&o)this.customAttributes[t]=n;else{if(!i)throw S.create("invalid attribute name",{attributeName:t});if(!o)throw S.create("invalid attribute value",{attributeValue:n})}}getAttribute(t){return this.customAttributes[t]}removeAttribute(t){void 0!==this.customAttributes[t]&&delete this.customAttributes[t]}getAttributes(){return Object.assign({},this.customAttributes)}setStartTime(t){this.startTimeUs=t}setDuration(t){this.durationUs=t}calculateTraceMetrics(){const t=this.api.getEntriesByName(this.traceMeasure),n=t&&t[0];n&&(this.durationUs=Math.floor(1e3*n.duration),this.startTimeUs=Math.floor(1e3*(n.startTime+this.api.getTimeOrigin())))}static createOobTrace(t,n,i,o,h){const v=Api.getInstance().getUrl();if(!v)return;const b=new Trace(t,s+v,!0),_=Math.floor(1e3*Api.getInstance().getTimeOrigin());b.setStartTime(_),n&&n[0]&&(b.setDuration(Math.floor(1e3*n[0].duration)),b.putMetric("domInteractive",Math.floor(1e3*n[0].domInteractive)),b.putMetric("domContentLoadedEventEnd",Math.floor(1e3*n[0].domContentLoadedEventEnd)),b.putMetric("loadEventEnd",Math.floor(1e3*n[0].loadEventEnd)));if(i){const t=i.find(t=>"first-paint"===t.name);t&&t.startTime&&b.putMetric("_fp",Math.floor(1e3*t.startTime));const n=i.find(t=>"first-contentful-paint"===t.name);n&&n.startTime&&b.putMetric(c,Math.floor(1e3*n.startTime)),h&&b.putMetric(l,Math.floor(1e3*h))}this.addWebVitalMetric(b,u,"lcp_element",o.lcp),this.addWebVitalMetric(b,f,"cls_largestShiftTarget",o.cls),this.addWebVitalMetric(b,p,"inp_interactionTarget",o.inp),logTrace(b),function flushLogs(){F&&F.flush()}()}static addWebVitalMetric(t,n,i,o){o&&(t.putMetric(n,Math.floor(1e3*o.value)),o.elementAttribution&&(o.elementAttribution.length>100?t.putAttribute(i,o.elementAttribution.substring(0,100)):t.putAttribute(i,o.elementAttribution)))}static createUserTimingTrace(t,n){logTrace(new Trace(t,n,!1,n))}}
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
   */let V,x={},j=!1;function setupOobResources(t){getIid()&&(setTimeout(()=>function setupOobTraces(t){const n=Api.getInstance();"onpagehide"in window?n.document.addEventListener("pagehide",()=>sendOobTrace(t)):n.document.addEventListener("unload",()=>sendOobTrace(t));n.document.addEventListener("visibilitychange",()=>{"hidden"===n.document.visibilityState&&sendOobTrace(t)}),n.onFirstInputDelay&&n.onFirstInputDelay(t=>{V=t});n.onLCP(t=>{x.lcp={value:t.value,elementAttribution:t.attribution?.element}}),n.onCLS(t=>{x.cls={value:t.value,elementAttribution:t.attribution?.largestShiftTarget}}),n.onINP(t=>{x.inp={value:t.value,elementAttribution:t.attribution?.interactionTarget}})}(t),0),setTimeout(()=>function setupNetworkRequests(t){const n=Api.getInstance(),i=n.getEntriesByType("resource");for(const n of i)createNetworkRequestEntry(t,n);n.setupObserver("resource",n=>createNetworkRequestEntry(t,n))}(t),0),setTimeout(()=>function setupUserTimingTraces(t){const n=Api.getInstance(),i=n.getEntriesByType("measure");for(const n of i)createUserTimingTrace(t,n);n.setupObserver("measure",n=>createUserTimingTrace(t,n))}(t),0))}function createUserTimingTrace(t,n){const i=n.name;i.substring(0,21)!==o&&Trace.createUserTimingTrace(t,i)}function sendOobTrace(t){if(!j){j=!0;const n=Api.getInstance(),i=n.getEntriesByType("navigation"),o=n.getEntriesByType("paint");setTimeout(()=>{Trace.createOobTrace(t,i,o,x,V)},0)}}
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
   */class PerformanceController{constructor(t,n){this.app=t,this.installations=n,this.initialized=!1}_init(t){this.initialized||(void 0!==t?.dataCollectionEnabled&&(this.dataCollectionEnabled=t.dataCollectionEnabled),void 0!==t?.instrumentationEnabled&&(this.instrumentationEnabled=t.instrumentationEnabled),Api.getInstance().requiredApisAvailable()?(0,r(d[1]).validateIndexedDBOpenable)().then(t=>{t&&(!function setupTransportService(){D||(processQueue(5500),D=!0)}(),getInitializationPromise(this).then(()=>setupOobResources(this),()=>setupOobResources(this)),this.initialized=!0)}).catch(t=>{T.info(`Environment doesn't support IndexedDB: ${t}`)}):T.info('Firebase Performance cannot start if the browser does not support "Fetch" and "Promise", or cookies are disabled.'))}set instrumentationEnabled(t){SettingsService.getInstance().instrumentationEnabled=t}get instrumentationEnabled(){return SettingsService.getInstance().instrumentationEnabled}set dataCollectionEnabled(t){SettingsService.getInstance().dataCollectionEnabled=t}get dataCollectionEnabled(){return SettingsService.getInstance().dataCollectionEnabled}}const factory=(t,{options:n})=>{const i=t.getProvider("app").getImmediate(),o=t.getProvider("installations-internal").getImmediate();if("[DEFAULT]"!==i.name)throw S.create("FB not default");if("undefined"==typeof window)throw S.create("no window");!function setupApi(t){y=t}
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
   */(window);const s=new PerformanceController(i,o);return s._init(n),s};!function registerPerformance(){(0,r(d[4])._registerComponent)(new(r(d[5]).Component)("performance",factory,"PUBLIC")),(0,r(d[4]).registerVersion)(t,n),(0,r(d[4]).registerVersion)(t,n,"esm2020")}()},2374,[2373,669,668,2375,671,672]);
__d(function(g,r,i,a,m,e,d){Object.defineProperty(e,"__esModule",{value:!0}),Object.keys(r(d[0])).forEach(function(n){"default"!==n&&"__esModule"!==n&&(n in e&&e[n]===r(d[0])[n]||Object.defineProperty(e,n,{enumerable:!0,get:function(){return r(d[0])[n]}}))})},2375,[2376]);
__d(function(_g,_r,_i,_a,_m,_e,_d){Object.defineProperty(_e,"__esModule",{value:!0}),_e.onTTFB=_e.onLCP=_e.onINP=_e.onFID=_e.onFCP=_e.onCLS=_e.TTFBThresholds=_e.LCPThresholds=_e.INPThresholds=_e.FIDThresholds=_e.FCPThresholds=_e.CLSThresholds=void 0;var e,g,n=function(){var e=self.performance&&performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];if(e&&e.responseStart>0&&e.responseStart<performance.now())return e},r=function(e){if("loading"===document.readyState)return"loading";var g=n();if(g){if(e<g.domInteractive)return"loading";if(0===g.domContentLoadedEventStart||e<g.domContentLoadedEventStart)return"dom-interactive";if(0===g.domComplete||e<g.domComplete)return"dom-content-loaded"}return"complete"},i=function(e){var g=e.nodeName;return 1===e.nodeType?g.toLowerCase():g.toUpperCase().replace(/^#/,"")},a=function(e,g){var L="";try{for(;e&&9!==e.nodeType;){var D=e,M=D.id?"#"+D.id:i(D)+(D.classList&&D.classList.value&&D.classList.value.trim()&&D.classList.value.trim().length?"."+D.classList.value.trim().replace(/\s+/g,"."):"");if(L.length+M.length>(g||100)-1)return L||M;if(L=L?M+">"+L:M,D.id)break;e=D.parentNode}}catch(e){}return L},L=-1,c=function(){return L},u=function(e){addEventListener("pageshow",function(g){g.persisted&&(L=g.timeStamp,e(g))},!0)},s=function(){var e=n();return e&&e.activationStart||0},f=function(e,g){var L=n(),D="navigate";return c()>=0?D="back-forward-cache":L&&(document.prerendering||s()>0?D="prerender":document.wasDiscarded?D="restore":L.type&&(D=L.type.replace(/_/g,"-"))),{name:e,value:void 0===g?-1:g,rating:"good",delta:0,entries:[],id:"v4-".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1e12),navigationType:D}},d=function(e,g,L){try{if(PerformanceObserver.supportedEntryTypes.includes(e)){var D=new PerformanceObserver(function(e){Promise.resolve().then(function(){g(e.getEntries())})});return D.observe(Object.assign({type:e,buffered:!0},L||{})),D}}catch(e){}},l=function(e,g,L,D){var M,I;return function(w){g.value>=0&&(w||D)&&((I=g.value-(M||0))||void 0===M)&&(M=g.value,g.delta=I,g.rating=function(e,g){return e>g[1]?"poor":e>g[0]?"needs-improvement":"good"}(g.value,L),e(g))}},m=function(e){requestAnimationFrame(function(){return requestAnimationFrame(function(){return e()})})},p=function(e){document.addEventListener("visibilitychange",function(){"hidden"===document.visibilityState&&e()})},v=function(e){var g=!1;return function(){g||(e(),g=!0)}},D=-1,h=function(){return"hidden"!==document.visibilityState||document.prerendering?1/0:0},T=function(e){"hidden"===document.visibilityState&&D>-1&&(D="visibilitychange"===e.type?e.timeStamp:0,E())},y=function(){addEventListener("visibilitychange",T,!0),addEventListener("prerenderingchange",T,!0)},E=function(){removeEventListener("visibilitychange",T,!0),removeEventListener("prerenderingchange",T,!0)},S=function(){return D<0&&(D=h(),y(),u(function(){setTimeout(function(){D=h(),y()},0)})),{get firstHiddenTime(){return D}}},b=function(e){document.prerendering?addEventListener("prerenderingchange",function(){return e()},!0):e()},M=_e.FCPThresholds=[1800,3e3],C=function(e,g){g=g||{},b(function(){var L,D=S(),I=f("FCP"),w=d("paint",function(e){e.forEach(function(e){"first-contentful-paint"===e.name&&(w.disconnect(),e.startTime<D.firstHiddenTime&&(I.value=Math.max(e.startTime-s(),0),I.entries.push(e),L(!0)))})});w&&(L=l(e,I,M,g.reportAllChanges),u(function(D){I=f("FCP"),L=l(e,I,M,g.reportAllChanges),m(function(){I.value=performance.now()-D.timeStamp,L(!0)})}))})},I=_e.CLSThresholds=[.1,.25],w=0,x=1/0,k=0,A=function(e){e.forEach(function(e){e.interactionId&&(x=Math.min(x,e.interactionId),k=Math.max(k,e.interactionId),w=k?(k-x)/7+1:0)})},F=function(){return e?w:performance.interactionCount||0},P=function(){"interactionCount"in performance||e||(e=d("event",A,{type:"event",buffered:!0,durationThreshold:0}))},B=[],O=new Map,j=0,R=[],H=function(e){if(R.forEach(function(g){return g(e)}),e.interactionId||"first-input"===e.entryType){var g=B[B.length-1],L=O.get(e.interactionId);if(L||B.length<10||e.duration>g.latency){if(L)e.duration>L.latency?(L.entries=[e],L.latency=e.duration):e.duration===L.latency&&e.startTime===L.entries[0].startTime&&L.entries.push(e);else{var D={id:e.interactionId,latency:e.duration,entries:[e]};O.set(D.id,D),B.push(D)}B.sort(function(e,g){return g.latency-e.latency}),B.length>10&&B.splice(10).forEach(function(e){return O.delete(e.id)})}}},N=function(e){var g=self.requestIdleCallback||self.setTimeout,L=-1;return e=v(e),"hidden"===document.visibilityState?e():(L=g(e),p(e)),L},q=_e.INPThresholds=[200,500],z=function(e,g){"PerformanceEventTiming"in self&&"interactionId"in PerformanceEventTiming.prototype&&(g=g||{},b(function(){var L;P();var D,M=f("INP"),a=function(e){N(function(){e.forEach(H);var g=function(){var e=Math.min(B.length-1,Math.floor((F()-j)/50));return B[e]}();g&&g.latency!==M.value&&(M.value=g.latency,M.entries=g.entries,D())})},I=d("event",a,{durationThreshold:null!==(L=g.durationThreshold)&&void 0!==L?L:40});D=l(e,M,q,g.reportAllChanges),I&&(I.observe({type:"first-input",buffered:!0}),p(function(){a(I.takeRecords()),D(!0)}),u(function(){j=F(),B.length=0,O.clear(),M=f("INP"),D=l(e,M,q,g.reportAllChanges)}))}))},_=[],W=[],U=0,V=new WeakMap,G=new Map,J=-1,Q=function(e){_=_.concat(e),X()},X=function(){J<0&&(J=N(Y))},Y=function(){G.size>10&&G.forEach(function(e,g){O.has(g)||G.delete(g)});var e=B.map(function(e){return V.get(e.entries[0])}),g=W.length-50;W=W.filter(function(L,D){return D>=g||e.includes(L)});for(var L=new Set,D=0;D<W.length;D++){var M=W[D];nt(M.startTime,M.processingEnd).forEach(function(e){L.add(e)})}var I=_.length-1-50;_=_.filter(function(e,g){return e.startTime>U&&g>I||L.has(e)}),J=-1};_e.onFCP=function(e,g){C(function(g){var L=function(e){var g={timeToFirstByte:0,firstByteToFCP:e.value,loadState:r(c())};if(e.entries.length){var L=n(),D=e.entries[e.entries.length-1];if(L){var M=L.activationStart||0,I=Math.max(0,L.responseStart-M);g={timeToFirstByte:I,firstByteToFCP:e.value-I,loadState:r(e.entries[0].startTime),navigationEntry:L,fcpEntry:D}}}return Object.assign(e,{attribution:g})}(g);e(L)},g)},_e.onCLS=function(e,g){!function(e,g){g=g||{},C(v(function(){var L,D=f("CLS",0),M=0,w=[],o=function(e){e.forEach(function(e){if(!e.hadRecentInput){var g=w[0],L=w[w.length-1];M&&e.startTime-L.startTime<1e3&&e.startTime-g.startTime<5e3?(M+=e.value,w.push(e)):(M=e.value,w=[e])}}),M>D.value&&(D.value=M,D.entries=w,L())},x=d("layout-shift",o);x&&(L=l(e,D,I,g.reportAllChanges),p(function(){o(x.takeRecords()),L(!0)}),u(function(){M=0,D=f("CLS",0),L=l(e,D,I,g.reportAllChanges),m(function(){return L()})}),setTimeout(L,0))}))}(function(g){var L=function(e){var g,L={};if(e.entries.length){var D=e.entries.reduce(function(e,g){return e&&e.value>g.value?e:g});if(D&&D.sources&&D.sources.length){var M=(g=D.sources).find(function(e){return e.node&&1===e.node.nodeType})||g[0];M&&(L={largestShiftTarget:a(M.node),largestShiftTime:D.startTime,largestShiftValue:D.value,largestShiftSource:M,largestShiftEntry:D,loadState:r(D.startTime)})}}return Object.assign(e,{attribution:L})}(g);e(L)},g)},R.push(function(e){e.interactionId&&e.target&&!G.has(e.interactionId)&&G.set(e.interactionId,e.target)},function(e){var g,L=e.startTime+e.duration;U=Math.max(U,e.processingEnd);for(var D=W.length-1;D>=0;D--){var M=W[D];if(Math.abs(L-M.renderTime)<=8){(g=M).startTime=Math.min(e.startTime,g.startTime),g.processingStart=Math.min(e.processingStart,g.processingStart),g.processingEnd=Math.max(e.processingEnd,g.processingEnd),g.entries.push(e);break}}g||(g={startTime:e.startTime,processingStart:e.processingStart,processingEnd:e.processingEnd,renderTime:L,entries:[e]},W.push(g)),(e.interactionId||"first-input"===e.entryType)&&V.set(e,g),X()});var K,Z,$,tt,nt=function(e,g){for(var L,D=[],M=0;L=_[M];M++)if(!(L.startTime+L.duration<e)){if(L.startTime>g)break;D.push(L)}return D},et=_e.LCPThresholds=[2500,4e3],rt={},it=_e.TTFBThresholds=[800,1800],at=function t(e){document.prerendering?b(function(){return t(e)}):"complete"!==document.readyState?addEventListener("load",function(){return t(e)},!0):setTimeout(e,0)},st=function(e,g){g=g||{};var L=f("TTFB"),D=l(e,L,it,g.reportAllChanges);at(function(){var M=n();M&&(L.value=Math.max(M.responseStart-s(),0),L.entries=[M],D(!0),u(function(){L=f("TTFB",0),(D=l(e,L,it,g.reportAllChanges))(!0)}))})},ot={passive:!0,capture:!0},ct=new Date,mt=function(e,g){K||(K=g,Z=e,$=new Date,gt(removeEventListener),pt())},pt=function(){if(Z>=0&&Z<$-ct){var e={entryType:"first-input",name:K.type,target:K.target,cancelable:K.cancelable,startTime:K.timeStamp,processingStart:K.timeStamp+Z};tt.forEach(function(g){g(e)}),tt=[]}},vt=function(e){if(e.cancelable){var g=(e.timeStamp>1e12?new Date:performance.now())-e.timeStamp;"pointerdown"==e.type?function(e,g){var n=function(){mt(e,g),i()},r=function(){i()},i=function(){removeEventListener("pointerup",n,ot),removeEventListener("pointercancel",r,ot)};addEventListener("pointerup",n,ot),addEventListener("pointercancel",r,ot)}(g,e):mt(g,e)}},gt=function(e){["mousedown","keydown","touchstart","pointerdown"].forEach(function(g){return e(g,vt,ot)})},ut=_e.FIDThresholds=[100,300];_e.onFID=function(e,g){!function(e,g){g=g||{},b(function(){var L,D=S(),M=f("FID"),a=function(e){e.startTime<D.firstHiddenTime&&(M.value=e.processingStart-e.startTime,M.entries.push(e),L(!0))},o=function(e){e.forEach(a)},I=d("first-input",o);L=l(e,M,ut,g.reportAllChanges),I&&(p(v(function(){o(I.takeRecords()),I.disconnect()})),u(function(){var D;M=f("FID"),L=l(e,M,ut,g.reportAllChanges),tt=[],Z=-1,K=null,gt(addEventListener),D=a,tt.push(D),pt()}))})}(function(g){var L=function(e){var g=e.entries[0],L={eventTarget:a(g.target),eventType:g.name,eventTime:g.startTime,eventEntry:g,loadState:r(g.startTime)};return Object.assign(e,{attribution:L})}(g);e(L)},g)},_e.onTTFB=function(e,g){st(function(g){var L=function(e){var g={waitingDuration:0,cacheDuration:0,dnsDuration:0,connectionDuration:0,requestDuration:0};if(e.entries.length){var L=e.entries[0],D=L.activationStart||0,M=Math.max((L.workerStart||L.fetchStart)-D,0),I=Math.max(L.domainLookupStart-D,0),w=Math.max(L.connectStart-D,0),x=Math.max(L.connectEnd-D,0);g={waitingDuration:M,cacheDuration:I-M,dnsDuration:w-I,connectionDuration:x-w,requestDuration:e.value-x,navigationEntry:L}}return Object.assign(e,{attribution:g})}(g);e(L)},g)},_e.onLCP=function(e,g){!function(e,g){g=g||{},b(function(){var L,D=S(),M=f("LCP"),a=function(e){g.reportAllChanges||(e=e.slice(-1)),e.forEach(function(e){e.startTime<D.firstHiddenTime&&(M.value=Math.max(e.startTime-s(),0),M.entries=[e],L())})},I=d("largest-contentful-paint",a);if(I){L=l(e,M,et,g.reportAllChanges);var w=v(function(){rt[M.id]||(a(I.takeRecords()),I.disconnect(),rt[M.id]=!0,L(!0))});["keydown","click"].forEach(function(e){addEventListener(e,function(){return N(w)},{once:!0,capture:!0})}),p(w),u(function(D){M=f("LCP"),L=l(e,M,et,g.reportAllChanges),m(function(){M.value=performance.now()-D.timeStamp,rt[M.id]=!0,L(!0)})})}})}(function(g){var L=function(e){var g={timeToFirstByte:0,resourceLoadDelay:0,resourceLoadDuration:0,elementRenderDelay:e.value};if(e.entries.length){var L=n();if(L){var D=L.activationStart||0,M=e.entries[e.entries.length-1],I=M.url&&performance.getEntriesByType("resource").filter(function(e){return e.name===M.url})[0],w=Math.max(0,L.responseStart-D),x=Math.max(w,I?(I.requestStart||I.startTime)-D:0),k=Math.max(x,I?I.responseEnd-D:0),B=Math.max(k,M.startTime-D);g={element:a(M.element),timeToFirstByte:w,resourceLoadDelay:x-w,resourceLoadDuration:k-x,elementRenderDelay:B-k,navigationEntry:L,lcpEntry:M},M.url&&(g.url=M.url),I&&(g.lcpResourceEntry=I)}}return Object.assign(e,{attribution:g})}(g);e(L)},g)},_e.onINP=function(e,L){g||(g=d("long-animation-frame",Q)),z(function(g){var L=function(e){var g=e.entries[0],L=V.get(g),D=g.processingStart,M=L.processingEnd,I=L.entries.sort(function(e,g){return e.processingStart-g.processingStart}),w=nt(g.startTime,M),x=e.entries.find(function(e){return e.target}),k=x&&x.target||G.get(g.interactionId),B=[g.startTime+g.duration,M].concat(w.map(function(e){return e.startTime+e.duration})),O=Math.max.apply(Math,B),j={interactionTarget:a(k),interactionTargetElement:k,interactionType:g.name.startsWith("key")?"keyboard":"pointer",interactionTime:g.startTime,nextPaintTime:O,processedEventEntries:I,longAnimationFrameEntries:w,inputDelay:D-g.startTime,processingDuration:M-D,presentationDelay:Math.max(O-M,0),loadState:r(g.startTime)};return Object.assign(e,{attribution:j})}(g);e(L)},L)}},2376,[]);