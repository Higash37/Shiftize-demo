__d(function(g,r,i,a,m,_e,d){Object.defineProperty(_e,"__esModule",{value:!0}),_e.deleteInstallations=
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
async function deleteInstallations(t){const{appConfig:e}=t,n=await update(e,t=>{if(!t||0!==t.registrationStatus)return t});if(n){if(1===n.registrationStatus)throw f.create("delete-pending-registration");if(2===n.registrationStatus){if(!navigator.onLine)throw f.create("app-offline");
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
await async function deleteInstallationRequest(t,e){const n=function getDeleteEndpoint(t,{fid:e}){return`${getInstallationsEndpoint(t)}/${e}`}(t,e),o=getHeadersWithAuth(t,e),s={method:"DELETE",headers:o},u=await retryIfServerError(()=>fetch(n,s));if(!u.ok)throw await getErrorFromResponse("Delete Installation",u)}(e,n),await remove(e)}}}
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
   */,_e.getId=getId,_e.getInstallations=
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
function getInstallations(t=(0,r(d[2]).getApp)()){return(0,r(d[2])._getProvider)(t,"installations").getImmediate()}
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
   */,_e.getToken=getToken,_e.onIdChange=function onIdChange(t,e){const{appConfig:n}=t;return function addCallback(t,e){getBroadcastChannel();const n=getKey(t);let o=w.get(n);o||(o=new Set,w.set(n,o));o.add(e)}(n,e),()=>{!function removeCallback(t,e){const n=getKey(t),o=w.get(n);if(!o)return;o.delete(e),0===o.size&&w.delete(n);closeBroadcastChannel()}(n,e)}};const t="@firebase/installations",e="0.6.19",n=1e4,o=`w:${e}`,s="FIS_v2",u="https://firebaseinstallations.googleapis.com/v1",c=36e5,l={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},f=new(r(d[0]).ErrorFactory)("installations","Installations",l);function isServerError(t){return t instanceof r(d[0]).FirebaseError&&t.code.includes("request-failed")}
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
   */function getInstallationsEndpoint({projectId:t}){return`${u}/projects/${t}/installations`}function extractAuthTokenInfoFromResponse(t){return{token:t.token,requestStatus:2,expiresIn:(e=t.expiresIn,Number(e.replace("s","000"))),creationTime:Date.now()};var e}async function getErrorFromResponse(t,e){const n=(await e.json()).error;return f.create("request-failed",{requestName:t,serverCode:n.code,serverMessage:n.message,serverStatus:n.status})}function getHeaders({apiKey:t}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function getHeadersWithAuth(t,{refreshToken:e}){const n=getHeaders(t);return n.append("Authorization",function getAuthorizationHeader(t){return`${s} ${t}`}
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
   */(e)),n}async function retryIfServerError(t){const e=await t();return e.status>=500&&e.status<600?t():e}
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
function sleep(t){return new Promise(e=>{setTimeout(e,t)})}
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
const p=/^[cdef][\w-]{21}$/,h="";function generateFid(){try{const t=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(t),t[0]=112+t[0]%16;const e=function encode(t){const e=function bufferToBase64UrlSafe(t){return btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_")}(t);return e.substr(0,22)}
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
   */(t);return p.test(e)?e:h}catch{return h}}function getKey(t){return`${t.appName}!${t.appId}`}
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
   */const w=new Map;function fidChanged(t,e){const n=getKey(t);callFidChangeCallbacks(n,e),function broadcastFidChange(t,e){const n=getBroadcastChannel();n&&n.postMessage({key:t,fid:e});closeBroadcastChannel()}(n,e)}function callFidChangeCallbacks(t,e){const n=w.get(t);if(n)for(const t of n)t(e)}let y=null;function getBroadcastChannel(){return!y&&"BroadcastChannel"in self&&(y=new BroadcastChannel("[Firebase] FID Change"),y.onmessage=t=>{callFidChangeCallbacks(t.data.key,t.data.fid)}),y}function closeBroadcastChannel(){0===w.size&&y&&(y.close(),y=null)}
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
   */const I="firebase-installations-database",C=1,T="firebase-installations-store";let k=null;function getDbPromise(){return k||(k=(0,r(d[1]).openDB)(I,C,{upgrade:(t,e)=>{if(0===e)t.createObjectStore(T)}})),k}async function set(t,e){const n=getKey(t),o=(await getDbPromise()).transaction(T,"readwrite"),s=o.objectStore(T),u=await s.get(n);return await s.put(e,n),await o.done,u&&u.fid===e.fid||fidChanged(t,e.fid),e}async function remove(t){const e=getKey(t),n=(await getDbPromise()).transaction(T,"readwrite");await n.objectStore(T).delete(e),await n.done}async function update(t,e){const n=getKey(t),o=(await getDbPromise()).transaction(T,"readwrite"),s=o.objectStore(T),u=await s.get(n),c=e(u);return void 0===c?await s.delete(n):await s.put(c,n),await o.done,!c||u&&u.fid===c.fid||fidChanged(t,c.fid),c}
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
   */async function getInstallationEntry(t){let e;const n=await update(t.appConfig,n=>{const u=function updateOrCreateInstallationEntry(t){const e=t||{fid:generateFid(),registrationStatus:0};return clearTimedOutRequest(e)}(n),c=function triggerRegistrationIfNecessary(t,e){if(0===e.registrationStatus){if(!navigator.onLine){return{installationEntry:e,registrationPromise:Promise.reject(f.create("app-offline"))}}const n={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},u=async function registerInstallation(t,e){try{const n=await async function createInstallationRequest({appConfig:t,heartbeatServiceProvider:e},{fid:n}){const u=getInstallationsEndpoint(t),c=getHeaders(t),l=e.getImmediate({optional:!0});if(l){const t=await l.getHeartbeatsHeader();t&&c.append("x-firebase-client",t)}const f={fid:n,authVersion:s,appId:t.appId,sdkVersion:o},p={method:"POST",headers:c,body:JSON.stringify(f)},h=await retryIfServerError(()=>fetch(u,p));if(h.ok){const t=await h.json();return{fid:t.fid||n,registrationStatus:2,refreshToken:t.refreshToken,authToken:extractAuthTokenInfoFromResponse(t.authToken)}}throw await getErrorFromResponse("Create Installation",h)}(t,e);return set(t.appConfig,n)}catch(n){throw isServerError(n)&&409===n.customData.serverCode?await remove(t.appConfig):await set(t.appConfig,{fid:e.fid,registrationStatus:0}),n}}(t,n);return{installationEntry:n,registrationPromise:u}}return 1===e.registrationStatus?{installationEntry:e,registrationPromise:waitUntilFidRegistration(t)}:{installationEntry:e}}(t,u);return e=c.registrationPromise,c.installationEntry});return n.fid===h?{installationEntry:await e}:{installationEntry:n,registrationPromise:e}}async function waitUntilFidRegistration(t){let e=await updateInstallationRequest(t.appConfig);for(;1===e.registrationStatus;)await sleep(100),e=await updateInstallationRequest(t.appConfig);if(0===e.registrationStatus){const{installationEntry:e,registrationPromise:n}=await getInstallationEntry(t);return n||e}return e}function updateInstallationRequest(t){return update(t,t=>{if(!t)throw f.create("installation-not-found");return clearTimedOutRequest(t)})}function clearTimedOutRequest(t){return function hasInstallationRequestTimedOut(t){return 1===t.registrationStatus&&t.registrationTime+n<Date.now()}
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
   */(t)?{fid:t.fid,registrationStatus:0}:t}async function generateAuthTokenRequest({appConfig:t,heartbeatServiceProvider:e},n){const s=function getGenerateAuthTokenEndpoint(t,{fid:e}){return`${getInstallationsEndpoint(t)}/${e}/authTokens:generate`}
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
   */(t,n),u=getHeadersWithAuth(t,n),c=e.getImmediate({optional:!0});if(c){const t=await c.getHeartbeatsHeader();t&&u.append("x-firebase-client",t)}const l={installation:{sdkVersion:o,appId:t.appId}},f={method:"POST",headers:u,body:JSON.stringify(l)},p=await retryIfServerError(()=>fetch(s,f));if(p.ok){return extractAuthTokenInfoFromResponse(await p.json())}throw await getErrorFromResponse("Generate Auth Token",p)}async function refreshAuthToken(t,e=!1){let n;const o=await update(t.appConfig,o=>{if(!isEntryRegistered(o))throw f.create("not-registered");const s=o.authToken;if(!e&&function isAuthTokenValid(t){return 2===t.requestStatus&&!function isAuthTokenExpired(t){const e=Date.now();return e<t.creationTime||t.creationTime+t.expiresIn<e+c}(t)}(s))return o;if(1===s.requestStatus)return n=async function waitUntilAuthTokenRequest(t,e){let n=await updateAuthTokenRequest(t.appConfig);for(;1===n.authToken.requestStatus;)await sleep(100),n=await updateAuthTokenRequest(t.appConfig);const o=n.authToken;return 0===o.requestStatus?refreshAuthToken(t,e):o}(t,e),o;{if(!navigator.onLine)throw f.create("app-offline");const e=function makeAuthTokenRequestInProgressEntry(t){const e={requestStatus:1,requestTime:Date.now()};return Object.assign({},t,{authToken:e})}(o);return n=async function fetchAuthTokenFromServer(t,e){try{const n=await generateAuthTokenRequest(t,e),o=Object.assign({},e,{authToken:n});return await set(t.appConfig,o),n}catch(n){if(!isServerError(n)||401!==n.customData.serverCode&&404!==n.customData.serverCode){const n=Object.assign({},e,{authToken:{requestStatus:0}});await set(t.appConfig,n)}else await remove(t.appConfig);throw n}}(t,e),e}});return n?await n:o.authToken}function updateAuthTokenRequest(t){return update(t,t=>{if(!isEntryRegistered(t))throw f.create("not-registered");return function hasAuthTokenRequestTimedOut(t){return 1===t.requestStatus&&t.requestTime+n<Date.now()}
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
   */(t.authToken)?Object.assign({},t,{authToken:{requestStatus:0}}):t})}function isEntryRegistered(t){return void 0!==t&&2===t.registrationStatus}async function getId(t){const e=t,{installationEntry:n,registrationPromise:o}=await getInstallationEntry(e);return o?o.catch(console.error):refreshAuthToken(e).catch(console.error),n.fid}
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
   */async function getToken(t,e=!1){const n=t;await async function completeInstallationRegistration(t){const{registrationPromise:e}=await getInstallationEntry(t);e&&await e}(n);return(await refreshAuthToken(n,e)).token}function getMissingValueError(t){return f.create("missing-app-config-values",{valueName:t})}
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
   */const v="installations",publicFactory=t=>{const e=t.getProvider("app").getImmediate(),n=function extractAppConfig(t){if(!t||!t.options)throw getMissingValueError("App Configuration");if(!t.name)throw getMissingValueError("App Name");const e=["projectId","apiKey","appId"];for(const n of e)if(!t.options[n])throw getMissingValueError(n);return{appName:t.name,projectId:t.options.projectId,apiKey:t.options.apiKey,appId:t.options.appId}}(e);return{app:e,appConfig:n,heartbeatServiceProvider:(0,r(d[2])._getProvider)(e,"heartbeat"),_delete:()=>Promise.resolve()}},internalFactory=t=>{const e=t.getProvider("app").getImmediate(),n=(0,r(d[2])._getProvider)(e,v).getImmediate();return{getId:()=>getId(n),getToken:t=>getToken(n,t)}};!function registerInstallations(){(0,r(d[2])._registerComponent)(new(r(d[3]).Component)(v,publicFactory,"PUBLIC")),(0,r(d[2])._registerComponent)(new(r(d[3]).Component)("installations-internal",internalFactory,"PRIVATE"))}(),(0,r(d[2]).registerVersion)(t,e),(0,r(d[2]).registerVersion)(t,e,"esm2020")},2396,[2120,2124,2122,2123]);