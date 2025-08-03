__d(function(g,_r,i,a,m,_e,d){var n=_r(d[0]);Object.defineProperty(_e,"__esModule",{value:!0}),_e.ShiftEmailNotificationService=_e.EmailService=void 0;var e=n(_r(d[1])),t=n(_r(d[2])),r=n(_r(d[3])),o=n(_r(d[4])),s=_r(d[5]);function ownKeys(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);e&&(r=r.filter(function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable})),t.push.apply(t,r)}return t}function _objectSpread(n){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?ownKeys(Object(r),!0).forEach(function(t){(0,e.default)(n,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(r)):ownKeys(Object(r)).forEach(function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(r,e))})}return n}var l=_e.EmailService=function(){return(0,o.default)(function EmailService(){(0,r.default)(this,EmailService)},null,[{key:"sendEmail",value:(n=(0,t.default)(function*(n){try{try{var e=(yield _r(d[7])(d[6],d.paths)).app,t=(0,s.getFunctions)(e,"asia-northeast1"),r=(0,s.httpsCallable)(t,"sendEmail");return!!(yield r({to:n.to,subject:n.subject,html:n.html,text:n.text})).data.success||(console.error("❌ Cloud Function returned failure"),!1)}catch(n){return console.error("❌ Cloud Function error:",n),!0}}catch(n){return console.error("❌ Email Service - Failed to send email:",n),!1}}),function sendEmail(e){return n.apply(this,arguments)})},{key:"generateEmailTemplate",value:function generateEmailTemplate(n,e,t,r){return`\n<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${n}</title>\n    <style>\n        body {\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            line-height: 1.6;\n            color: #333;\n            max-width: 600px;\n            margin: 0 auto;\n            padding: 20px;\n            background-color: #f5f5f5;\n        }\n        .email-container {\n            background-color: white;\n            border-radius: 8px;\n            padding: 30px;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n        }\n        .header {\n            text-align: center;\n            margin-bottom: 30px;\n            padding-bottom: 20px;\n            border-bottom: 2px solid #007bff;\n        }\n        .emoji {\n            font-size: 48px;\n            margin-bottom: 10px;\n        }\n        .title {\n            color: #007bff;\n            font-size: 24px;\n            font-weight: bold;\n            margin: 0;\n        }\n        .content {\n            margin-bottom: 30px;\n            font-size: 16px;\n        }\n        .shift-details {\n            background-color: #f8f9fa;\n            padding: 20px;\n            border-radius: 5px;\n            border-left: 4px solid #007bff;\n            margin: 20px 0;\n        }\n        .shift-details h3 {\n            margin-top: 0;\n            color: #007bff;\n        }\n        .detail-row {\n            display: flex;\n            justify-content: space-between;\n            margin: 10px 0;\n            padding: 5px 0;\n            border-bottom: 1px solid #eee;\n        }\n        .detail-row:last-child {\n            border-bottom: none;\n        }\n        .detail-label {\n            font-weight: bold;\n            color: #666;\n        }\n        .footer {\n            text-align: center;\n            margin-top: 30px;\n            padding-top: 20px;\n            border-top: 1px solid #eee;\n            color: #666;\n            font-size: 14px;\n        }\n        .app-name {\n            color: #007bff;\n            font-weight: bold;\n        }\n    </style>\n</head>\n<body>\n    <div class="email-container">\n        <div class="header">\n            <div class="emoji">${e}</div>\n            <h1 class="title">${n}</h1>\n        </div>\n        \n        <div class="content">\n            ${t}\n        </div>\n        \n        ${r?`\n        <div class="shift-details">\n            <h3>シフト詳細</h3>\n            <div class="detail-row">\n                <span class="detail-label">日付:</span>\n                <span>${r.shiftDate}</span>\n            </div>\n            <div class="detail-row">\n                <span class="detail-label">時間:</span>\n                <span>${r.startTime} - ${r.endTime}</span>\n            </div>\n            <div class="detail-row">\n                <span class="detail-label">担当者:</span>\n                <span>${r.userNickname}</span>\n            </div>\n            ${r.masterNickname?`\n            <div class="detail-row">\n                <span class="detail-label">操作者:</span>\n                <span>${r.masterNickname}</span>\n            </div>\n            `:""}\n            ${r.status?`\n            <div class="detail-row">\n                <span class="detail-label">状態:</span>\n                <span>${r.status}</span>\n            </div>\n            `:""}\n            ${r.reason?`\n            <div class="detail-row">\n                <span class="detail-label">理由:</span>\n                <span>${r.reason}</span>\n            </div>\n            `:""}\n        </div>\n        `:""}\n        \n        <div class="footer">\n            <p>このメールは <span class="app-name">Shiftize</span> から自動送信されています。</p>\n            <p>アプリで詳細を確認し、必要に応じて対応を行ってください。</p>\n        </div>\n    </div>\n</body>\n</html>\n    `}}]);var n}();l.config={host:"smtp.gmail.com",port:587,secure:!1,auth:{user:"prod-email@example.com",pass:"prod-password"}};_e.ShiftEmailNotificationService=function(){return(0,o.default)(function ShiftEmailNotificationService(){(0,r.default)(this,ShiftEmailNotificationService)},null,[{key:"notifyShiftCreated",value:(s=(0,t.default)(function*(n,e){var t=`新しいシフトが追加されました - ${e.shiftDate}`,r=`\n      <p><strong>${e.userNickname}</strong>さんが新しいシフトを作成しました。</p>\n      <p>アプリで詳細を確認し、必要に応じて承認を行ってください。</p>\n    `,o=l.generateEmailTemplate("新しいシフトが追加されました","📅",r,e);return l.sendEmail({to:n,subject:t,html:o})}),function notifyShiftCreated(n,e){return s.apply(this,arguments)})},{key:"notifyShiftDeleted",value:(e=(0,t.default)(function*(n,e){var t=`シフトが削除されました - ${e.shiftDate}`,r=`\n      <p>こんにちは、<strong>${e.userNickname}</strong>さん</p>\n      <p><strong>${e.masterNickname}</strong>さんがあなたの以下のシフトを削除しました。</p>\n      <p>ご質問がある場合は、${e.masterNickname}さんまたは管理者にお問い合わせください。</p>\n    `,o=l.generateEmailTemplate("シフトが削除されました","🗑️",r,e);return l.sendEmail({to:n,subject:t,html:o})}),function notifyShiftDeleted(n,t){return e.apply(this,arguments)})},{key:"notifyShiftApproved",value:(n=(0,t.default)(function*(n,e){var t=`シフトが承認されました - ${e.shiftDate}`,r=`\n      <p>こんにちは、<strong>${e.userNickname}</strong>さん</p>\n      <p><strong>${e.masterNickname}</strong>さんがあなたのシフトを承認しました！</p>\n      <p>シフトが確定しました。当日の勤務をよろしくお願いします。</p>\n    `,o=l.generateEmailTemplate("シフトが承認されました","✅",r,_objectSpread(_objectSpread({},e),{},{status:"承認済み"}));return l.sendEmail({to:n,subject:t,html:o})}),function notifyShiftApproved(e,t){return n.apply(this,arguments)})}]);var n,e,s}()},2197,{"0":34,"1":39,"2":6,"3":14,"4":10,"5":2200,"6":556,"7":562,"paths":{"556":"/_expo/static/js/web/entry-fe3bf4daa96c576d68fbbb2896c64726.js"}});
__d(function(g,r,i,a,m,e,d){Object.defineProperty(e,"__esModule",{value:!0});var t=r(d[0]);Object.keys(t).forEach(function(n){"default"!==n&&"__esModule"!==n&&(n in e&&e[n]===t[n]||Object.defineProperty(e,n,{enumerable:!0,get:function get(){return t[n]}}))})},2200,[2201]);
__d(function(g,r,i,a,m,_e,d){var e=r(d[0]);Object.defineProperty(_e,"__esModule",{value:!0}),_e.connectFunctionsEmulator=connectFunctionsEmulator,_e.getFunctions=
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
function getFunctions(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:(0,f.getApp)(),n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:T,o=(0,f._getProvider)((0,p.getModularInstance)(e),v).getImmediate({identifier:n}),u=(0,p.getDefaultEmulatorHostnameAndPort)("functions");u&&connectFunctionsEmulator.apply(void 0,[o].concat((0,t.default)(u)));return o},_e.httpsCallable=function httpsCallable(e,t,n){return function httpsCallable$1(e,t,n){return function(o){return function call(e,t,n,o){var u=e._url(t);return callAtURL(e,u,n,o)}(e,t,o,n||{})}}((0,p.getModularInstance)(e),t,n)},_e.httpsCallableFromURL=function httpsCallableFromURL(e,t,n){return function httpsCallableFromURL$1(e,t,n){return function(o){return callAtURL(e,t,o,n||{})}}((0,p.getModularInstance)(e),t,n)};var t=e(r(d[1])),n=e(r(d[2])),o=e(r(d[3])),u=e(r(d[4])),c=e(r(d[5])),s=e(r(d[6])),l=e(r(d[7])),f=r(d[8]),p=r(d[9]),h=r(d[10]);function _isNativeReflectConstruct(){try{var e=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}))}catch(e){}return(_isNativeReflectConstruct=function _isNativeReflectConstruct(){return!!e})()}
/**
   * @license
   * Copyright 2017 Google LLC
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
   */function mapValues(e,t){var n={};for(var o in e)e.hasOwnProperty(o)&&(n[o]=t(e[o]));return n}function encode(e){if(null==e)return null;if(e instanceof Number&&(e=e.valueOf()),"number"==typeof e&&isFinite(e))return e;if(!0===e||!1===e)return e;if("[object String]"===Object.prototype.toString.call(e))return e;if(e instanceof Date)return e.toISOString();if(Array.isArray(e))return e.map(function(e){return encode(e)});if("function"==typeof e||"object"==typeof e)return mapValues(e,function(e){return encode(e)});throw new Error("Data cannot be encoded in JSON: "+e)}function decode(e){if(null==e)return e;if(e["@type"])switch(e["@type"]){case"type.googleapis.com/google.protobuf.Int64Value":case"type.googleapis.com/google.protobuf.UInt64Value":var t=Number(e.value);if(isNaN(t))throw new Error("Data cannot be decoded from JSON: "+e);return t;default:throw new Error("Data cannot be decoded from JSON: "+e)}return Array.isArray(e)?e.map(function(e){return decode(e)}):"function"==typeof e||"object"==typeof e?mapValues(e,function(e){return decode(e)}):e}
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
   */var v="functions",y={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"},k=function(e){function FunctionsError(e,t,n){var o;return(0,u.default)(this,FunctionsError),(o=function _callSuper(e,t,n){return t=(0,s.default)(t),(0,c.default)(e,_isNativeReflectConstruct()?Reflect.construct(t,n||[],(0,s.default)(e).constructor):t.apply(e,n))}(this,FunctionsError,[`${v}/${e}`,t||""])).details=n,o}return(0,l.default)(FunctionsError,e),(0,o.default)(FunctionsError)}(p.FirebaseError);
/**
   * @license
   * Copyright 2017 Google LLC
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
   * Copyright 2017 Google LLC
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
var E=function(){return(0,o.default)(function ContextProvider(e,t,n){var o=this;(0,u.default)(this,ContextProvider),this.auth=null,this.messaging=null,this.appCheck=null,this.auth=e.getImmediate({optional:!0}),this.messaging=t.getImmediate({optional:!0}),this.auth||e.get().then(function(e){return o.auth=e},function(){}),this.messaging||t.get().then(function(e){return o.messaging=e},function(){}),this.appCheck||n.get().then(function(e){return o.appCheck=e},function(){})},[{key:"getAuthToken",value:(s=(0,n.default)(function*(){if(this.auth)try{var e=yield this.auth.getToken();return null==e?void 0:e.accessToken}catch(e){return}}),function getAuthToken(){return s.apply(this,arguments)})},{key:"getMessagingToken",value:(c=(0,n.default)(function*(){if(this.messaging&&"Notification"in self&&"granted"===Notification.permission)try{return yield this.messaging.getToken()}catch(e){return}}),function getMessagingToken(){return c.apply(this,arguments)})},{key:"getAppCheckToken",value:(t=(0,n.default)(function*(e){if(this.appCheck){var t=e?yield this.appCheck.getLimitedUseToken():yield this.appCheck.getToken();return t.error?null:t.token}return null}),function getAppCheckToken(e){return t.apply(this,arguments)})},{key:"getContext",value:(e=(0,n.default)(function*(e){return{authToken:yield this.getAuthToken(),messagingToken:yield this.getMessagingToken(),appCheckToken:yield this.getAppCheckToken(e)}}),function getContext(t){return e.apply(this,arguments)})}]);var e,t,c,s}(),T="us-central1";
/**
   * @license
   * Copyright 2017 Google LLC
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
   */var A=function(){return(0,o.default)(function FunctionsService(e,t,n,o){var c=this,s=arguments.length>4&&void 0!==arguments[4]?arguments[4]:T,l=arguments.length>5?arguments[5]:void 0;(0,u.default)(this,FunctionsService),this.app=e,this.fetchImpl=l,this.emulatorOrigin=null,this.contextProvider=new E(t,n,o),this.cancelAllRequests=new Promise(function(e){c.deleteService=function(){return Promise.resolve(e())}});try{var f=new URL(s);this.customDomain=f.origin+("/"===f.pathname?"":f.pathname),this.region=T}catch(e){this.customDomain=null,this.region=s}},[{key:"_delete",value:function _delete(){return this.deleteService()}},{key:"_url",value:function _url(e){var t=this.app.options.projectId;return null!==this.emulatorOrigin?`${this.emulatorOrigin}/${t}/${this.region}/${e}`:null!==this.customDomain?`${this.customDomain}/${e}`:`https://${this.region}-${t}.cloudfunctions.net/${e}`}}])}();function postJSON(e,t,n,o){return _postJSON.apply(this,arguments)}function _postJSON(){return(_postJSON=(0,n.default)(function*(e,t,n,o){var u;n["Content-Type"]="application/json";try{u=yield o(e,{method:"POST",body:JSON.stringify(t),headers:n})}catch(e){return{status:0,json:null}}var c=null;try{c=yield u.json()}catch(e){}return{status:u.status,json:c}})).apply(this,arguments)}function callAtURL(e,t,n,o){return _callAtURL.apply(this,arguments)}function _callAtURL(){return(_callAtURL=(0,n.default)(function*(e,t,n,o){var u={data:n=encode(n)},c={},s=yield e.contextProvider.getContext(o.limitedUseAppCheckTokens);s.authToken&&(c.Authorization="Bearer "+s.authToken),s.messagingToken&&(c["Firebase-Instance-ID-Token"]=s.messagingToken),null!==s.appCheckToken&&(c["X-Firebase-AppCheck"]=s.appCheckToken);var l=function failAfter(e){var t=null;return{promise:new Promise(function(n,o){t=setTimeout(function(){o(new k("deadline-exceeded","deadline-exceeded"))},e)}),cancel:function cancel(){t&&clearTimeout(t)}}}(o.timeout||7e4),f=yield Promise.race([postJSON(t,u,c,e.fetchImpl),l.promise,e.cancelAllRequests]);if(l.cancel(),!f)throw new k("cancelled","Firebase Functions instance was deleted.");var p=function _errorForResponse(e,t){var n=function codeForHTTPStatus(e){if(e>=200&&e<300)return"ok";switch(e){case 0:case 500:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}(e),o=n,u=void 0;try{var c=t&&t.error;if(c){var s=c.status;if("string"==typeof s){if(!y[s])return new k("internal","internal");n=y[s],o=s}var l=c.message;"string"==typeof l&&(o=l),void 0!==(u=c.details)&&(u=decode(u))}}catch(e){}return"ok"===n?null:new k(n,o,u)}(f.status,f.json);if(p)throw p;if(!f.json)throw new k("internal","Response is not valid JSON object.");var h=f.json.data;if(void 0===h&&(h=f.json.result),void 0===h)throw new k("internal","Response is missing data field.");return{data:decode(h)}})).apply(this,arguments)}var N="@firebase/functions",C="0.11.8";function connectFunctionsEmulator(e,t,n){!function connectFunctionsEmulator$1(e,t,n){e.emulatorOrigin=`http://${t}:${n}`}((0,p.getModularInstance)(e),t,n)}!function registerFunctions(e,t){(0,f._registerComponent)(new h.Component(v,function factory(t,n){var o=n.instanceIdentifier,u=t.getProvider("app").getImmediate(),c=t.getProvider("auth-internal"),s=t.getProvider("messaging-internal"),l=t.getProvider("app-check-internal");return new A(u,c,s,l,o,e)},"PUBLIC").setMultipleInstances(!0)),(0,f.registerVersion)(N,C,t),(0,f.registerVersion)(N,C,"esm2017")}(fetch.bind(self))},2201,[34,55,6,10,14,15,17,18,544,546,545]);