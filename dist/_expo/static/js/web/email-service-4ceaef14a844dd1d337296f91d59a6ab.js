__d(function(g,_r,i,a,m,_e,d){var n=_r(d[0]);Object.defineProperty(_e,"__esModule",{value:!0}),_e.ShiftEmailNotificationService=_e.EmailService=void 0;var e=n(_r(d[1])),t=n(_r(d[2])),r=n(_r(d[3])),o=n(_r(d[4])),s=_r(d[5]);function l(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);e&&(r=r.filter(function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable})),t.push.apply(t,r)}return t}function p(n){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach(function(t){(0,e.default)(n,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach(function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(r,e))})}return n}var c=_e.EmailService=function(){return(0,o.default)(function n(){(0,r.default)(this,n)},null,[{key:"sendEmail",value:(n=(0,t.default)(function*(n){try{try{var e=(yield _r(d[7])(d[6],d.paths)).app,t=(0,s.getFunctions)(e,"asia-northeast1"),r=(0,s.httpsCallable)(t,"sendEmail");return!!(yield r({to:n.to,subject:n.subject,html:n.html,text:n.text})).data.success||(console.error("❌ Cloud Function returned failure"),!1)}catch(n){return console.error("❌ Cloud Function error:",n),!0}}catch(n){return console.error("❌ Email Service - Failed to send email:",n),!1}}),function(e){return n.apply(this,arguments)})},{key:"generateEmailTemplate",value:function(n,e,t,r){return`\n<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${n}</title>\n    <style>\n        body {\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n            line-height: 1.6;\n            color: #333;\n            max-width: 600px;\n            margin: 0 auto;\n            padding: 20px;\n            background-color: #f5f5f5;\n        }\n        .email-container {\n            background-color: white;\n            border-radius: 8px;\n            padding: 30px;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n        }\n        .header {\n            text-align: center;\n            margin-bottom: 30px;\n            padding-bottom: 20px;\n            border-bottom: 2px solid #007bff;\n        }\n        .emoji {\n            font-size: 48px;\n            margin-bottom: 10px;\n        }\n        .title {\n            color: #007bff;\n            font-size: 24px;\n            font-weight: bold;\n            margin: 0;\n        }\n        .content {\n            margin-bottom: 30px;\n            font-size: 16px;\n        }\n        .shift-details {\n            background-color: #f8f9fa;\n            padding: 20px;\n            border-radius: 5px;\n            border-left: 4px solid #007bff;\n            margin: 20px 0;\n        }\n        .shift-details h3 {\n            margin-top: 0;\n            color: #007bff;\n        }\n        .detail-row {\n            display: flex;\n            justify-content: space-between;\n            margin: 10px 0;\n            padding: 5px 0;\n            border-bottom: 1px solid #eee;\n        }\n        .detail-row:last-child {\n            border-bottom: none;\n        }\n        .detail-label {\n            font-weight: bold;\n            color: #666;\n        }\n        .footer {\n            text-align: center;\n            margin-top: 30px;\n            padding-top: 20px;\n            border-top: 1px solid #eee;\n            color: #666;\n            font-size: 14px;\n        }\n        .app-name {\n            color: #007bff;\n            font-weight: bold;\n        }\n    </style>\n</head>\n<body>\n    <div class="email-container">\n        <div class="header">\n            <div class="emoji">${e}</div>\n            <h1 class="title">${n}</h1>\n        </div>\n        \n        <div class="content">\n            ${t}\n        </div>\n        \n        ${r?`\n        <div class="shift-details">\n            <h3>シフト詳細</h3>\n            <div class="detail-row">\n                <span class="detail-label">日付:</span>\n                <span>${r.shiftDate}</span>\n            </div>\n            <div class="detail-row">\n                <span class="detail-label">時間:</span>\n                <span>${r.startTime} - ${r.endTime}</span>\n            </div>\n            <div class="detail-row">\n                <span class="detail-label">担当者:</span>\n                <span>${r.userNickname}</span>\n            </div>\n            ${r.masterNickname?`\n            <div class="detail-row">\n                <span class="detail-label">操作者:</span>\n                <span>${r.masterNickname}</span>\n            </div>\n            `:""}\n            ${r.status?`\n            <div class="detail-row">\n                <span class="detail-label">状態:</span>\n                <span>${r.status}</span>\n            </div>\n            `:""}\n            ${r.reason?`\n            <div class="detail-row">\n                <span class="detail-label">理由:</span>\n                <span>${r.reason}</span>\n            </div>\n            `:""}\n        </div>\n        `:""}\n        \n        <div class="footer">\n            <p>このメールは <span class="app-name">Shiftize</span> から自動送信されています。</p>\n            <p>アプリで詳細を確認し、必要に応じて対応を行ってください。</p>\n        </div>\n    </div>\n</body>\n</html>\n    `}}]);var n}();c.config={host:"smtp.gmail.com",port:587,secure:!1,auth:{user:"prod-email@example.com",pass:"prod-password"}};_e.ShiftEmailNotificationService=function(){return(0,o.default)(function n(){(0,r.default)(this,n)},null,[{key:"notifyShiftCreated",value:(s=(0,t.default)(function*(n,e){var t=`新しいシフトが追加されました - ${e.shiftDate}`,r=`\n      <p><strong>${e.userNickname}</strong>さんが新しいシフトを作成しました。</p>\n      <p>アプリで詳細を確認し、必要に応じて承認を行ってください。</p>\n    `,o=c.generateEmailTemplate("新しいシフトが追加されました","📅",r,e);return c.sendEmail({to:n,subject:t,html:o})}),function(n,e){return s.apply(this,arguments)})},{key:"notifyShiftDeleted",value:(e=(0,t.default)(function*(n,e){var t=`シフトが削除されました - ${e.shiftDate}`,r=`\n      <p>こんにちは、<strong>${e.userNickname}</strong>さん</p>\n      <p><strong>${e.masterNickname}</strong>さんがあなたの以下のシフトを削除しました。</p>\n      <p>ご質問がある場合は、${e.masterNickname}さんまたは管理者にお問い合わせください。</p>\n    `,o=c.generateEmailTemplate("シフトが削除されました","🗑️",r,e);return c.sendEmail({to:n,subject:t,html:o})}),function(n,t){return e.apply(this,arguments)})},{key:"notifyShiftApproved",value:(n=(0,t.default)(function*(n,e){var t=`シフトが承認されました - ${e.shiftDate}`,r=`\n      <p>こんにちは、<strong>${e.userNickname}</strong>さん</p>\n      <p><strong>${e.masterNickname}</strong>さんがあなたのシフトを承認しました！</p>\n      <p>シフトが確定しました。当日の勤務をよろしくお願いします。</p>\n    `,o=c.generateEmailTemplate("シフトが承認されました","✅",r,p(p({},e),{},{status:"承認済み"}));return c.sendEmail({to:n,subject:t,html:o})}),function(e,t){return n.apply(this,arguments)})}]);var n,e,s}()},2175,{"0":34,"1":39,"2":6,"3":14,"4":10,"5":2178,"6":556,"7":562,"paths":{"556":"/_expo/static/js/web/entry-7d8a72fd569ebd14bd20932aaac9b996.js"}});
__d(function(g,r,i,a,m,e,d){Object.defineProperty(e,"__esModule",{value:!0});var n=r(d[0]);Object.keys(n).forEach(function(t){"default"!==t&&"__esModule"!==t&&(t in e&&e[t]===n[t]||Object.defineProperty(e,t,{enumerable:!0,get:function(){return n[t]}}))})},2178,[2179]);
__d(function(g,r,i,a,m,_e,d){var e=r(d[0]);Object.defineProperty(_e,"__esModule",{value:!0}),_e.connectFunctionsEmulator=j,_e.getFunctions=
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
function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:(0,f.getApp)(),n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:w,o=(0,f._getProvider)((0,h.getModularInstance)(e),E).getImmediate({identifier:n}),u=(0,h.getDefaultEmulatorHostnameAndPort)("functions");u&&j.apply(void 0,[o].concat((0,t.default)(u)));return o},_e.httpsCallable=function(e,t,n){return function(e,t,n){return function(o){return function(e,t,n,o){var u=e._url(t);return D(e,u,n,o)}(e,t,o,n||{})}}((0,h.getModularInstance)(e),t,n)},_e.httpsCallableFromURL=function(e,t,n){return function(e,t,n){return function(o){return D(e,t,o,n||{})}}((0,h.getModularInstance)(e),t,n)};var t=e(r(d[1])),n=e(r(d[2])),o=e(r(d[3])),u=e(r(d[4])),s=e(r(d[5])),c=e(r(d[6])),l=e(r(d[7])),f=r(d[8]),h=r(d[9]),p=r(d[10]);function v(){try{var e=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}))}catch(e){}return(v=function(){return!!e})()}
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
   */function y(e,t){var n={};for(var o in e)e.hasOwnProperty(o)&&(n[o]=t(e[o]));return n}function k(e){if(null==e)return null;if(e instanceof Number&&(e=e.valueOf()),"number"==typeof e&&isFinite(e))return e;if(!0===e||!1===e)return e;if("[object String]"===Object.prototype.toString.call(e))return e;if(e instanceof Date)return e.toISOString();if(Array.isArray(e))return e.map(function(e){return k(e)});if("function"==typeof e||"object"==typeof e)return y(e,function(e){return k(e)});throw new Error("Data cannot be encoded in JSON: "+e)}function T(e){if(null==e)return e;if(e["@type"])switch(e["@type"]){case"type.googleapis.com/google.protobuf.Int64Value":case"type.googleapis.com/google.protobuf.UInt64Value":var t=Number(e.value);if(isNaN(t))throw new Error("Data cannot be decoded from JSON: "+e);return t;default:throw new Error("Data cannot be decoded from JSON: "+e)}return Array.isArray(e)?e.map(function(e){return T(e)}):"function"==typeof e||"object"==typeof e?y(e,function(e){return T(e)}):e}
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
   */var E="functions",A={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"},I=function(e){function t(e,n,o){var l,f,h,p;return(0,u.default)(this,t),f=this,h=t,p=[`${E}/${e}`,n||""],h=(0,c.default)(h),(l=(0,s.default)(f,v()?Reflect.construct(h,p||[],(0,c.default)(f).constructor):h.apply(f,p))).details=o,l}return(0,l.default)(t,e),(0,o.default)(t)}(h.FirebaseError);
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
var N=function(){return(0,o.default)(function e(t,n,o){var s=this;(0,u.default)(this,e),this.auth=null,this.messaging=null,this.appCheck=null,this.auth=t.getImmediate({optional:!0}),this.messaging=n.getImmediate({optional:!0}),this.auth||t.get().then(function(e){return s.auth=e},function(){}),this.messaging||n.get().then(function(e){return s.messaging=e},function(){}),this.appCheck||o.get().then(function(e){return s.appCheck=e},function(){})},[{key:"getAuthToken",value:(c=(0,n.default)(function*(){if(this.auth)try{var e=yield this.auth.getToken();return null==e?void 0:e.accessToken}catch(e){return}}),function(){return c.apply(this,arguments)})},{key:"getMessagingToken",value:(s=(0,n.default)(function*(){if(this.messaging&&"Notification"in self&&"granted"===Notification.permission)try{return yield this.messaging.getToken()}catch(e){return}}),function(){return s.apply(this,arguments)})},{key:"getAppCheckToken",value:(t=(0,n.default)(function*(e){if(this.appCheck){var t=e?yield this.appCheck.getLimitedUseToken():yield this.appCheck.getToken();return t.error?null:t.token}return null}),function(e){return t.apply(this,arguments)})},{key:"getContext",value:(e=(0,n.default)(function*(e){return{authToken:yield this.getAuthToken(),messagingToken:yield this.getMessagingToken(),appCheckToken:yield this.getAppCheckToken(e)}}),function(t){return e.apply(this,arguments)})}]);var e,t,s,c}(),w="us-central1";
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
   */var O=function(){return(0,o.default)(function e(t,n,o,s){var c=this,l=arguments.length>4&&void 0!==arguments[4]?arguments[4]:w,f=arguments.length>5?arguments[5]:void 0;(0,u.default)(this,e),this.app=t,this.fetchImpl=f,this.emulatorOrigin=null,this.contextProvider=new N(n,o,s),this.cancelAllRequests=new Promise(function(e){c.deleteService=function(){return Promise.resolve(e())}});try{var h=new URL(l);this.customDomain=h.origin+("/"===h.pathname?"":h.pathname),this.region=w}catch(e){this.customDomain=null,this.region=l}},[{key:"_delete",value:function(){return this.deleteService()}},{key:"_url",value:function(e){var t=this.app.options.projectId;return null!==this.emulatorOrigin?`${this.emulatorOrigin}/${t}/${this.region}/${e}`:null!==this.customDomain?`${this.customDomain}/${e}`:`https://${this.region}-${t}.cloudfunctions.net/${e}`}}])}();function b(e,t,n,o){return C.apply(this,arguments)}function C(){return(C=(0,n.default)(function*(e,t,n,o){var u;n["Content-Type"]="application/json";try{u=yield o(e,{method:"POST",body:JSON.stringify(t),headers:n})}catch(e){return{status:0,json:null}}var s=null;try{s=yield u.json()}catch(e){}return{status:u.status,json:s}})).apply(this,arguments)}function D(e,t,n,o){return S.apply(this,arguments)}function S(){return(S=(0,n.default)(function*(e,t,n,o){var u={data:n=k(n)},s={},c=yield e.contextProvider.getContext(o.limitedUseAppCheckTokens);c.authToken&&(s.Authorization="Bearer "+c.authToken),c.messagingToken&&(s["Firebase-Instance-ID-Token"]=c.messagingToken),null!==c.appCheckToken&&(s["X-Firebase-AppCheck"]=c.appCheckToken);var l,f,h=o.timeout||7e4,p=(l=h,f=null,{promise:new Promise(function(e,t){f=setTimeout(function(){t(new I("deadline-exceeded","deadline-exceeded"))},l)}),cancel:function(){f&&clearTimeout(f)}}),v=yield Promise.race([b(t,u,s,e.fetchImpl),p.promise,e.cancelAllRequests]);if(p.cancel(),!v)throw new I("cancelled","Firebase Functions instance was deleted.");var y=function(e,t){var n=function(e){if(e>=200&&e<300)return"ok";switch(e){case 0:case 500:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}(e),o=n,u=void 0;try{var s=t&&t.error;if(s){var c=s.status;if("string"==typeof c){if(!A[c])return new I("internal","internal");n=A[c],o=c}var l=s.message;"string"==typeof l&&(o=l),void 0!==(u=s.details)&&(u=T(u))}}catch(e){}return"ok"===n?null:new I(n,o,u)}(v.status,v.json);if(y)throw y;if(!v.json)throw new I("internal","Response is not valid JSON object.");var E=v.json.data;if(void 0===E&&(E=v.json.result),void 0===E)throw new I("internal","Response is missing data field.");return{data:T(E)}})).apply(this,arguments)}var P,_,R="@firebase/functions",U="0.11.8";function j(e,t,n){!function(e,t,n){e.emulatorOrigin=`http://${t}:${n}`}((0,h.getModularInstance)(e),t,n)}P=fetch.bind(self),(0,f._registerComponent)(new p.Component(E,function(e,t){var n=t.instanceIdentifier,o=e.getProvider("app").getImmediate(),u=e.getProvider("auth-internal"),s=e.getProvider("messaging-internal"),c=e.getProvider("app-check-internal");return new O(o,u,s,c,n,P)},"PUBLIC").setMultipleInstances(!0)),(0,f.registerVersion)(R,U,_),(0,f.registerVersion)(R,U,"esm2017")},2179,[34,55,6,10,14,15,17,18,544,546,545]);