/**
 * @file index.tsx（ルートインデックス）
 * @description アプリのルートURL "/" にアクセスした時のページ。
 *
 * ============================================================
 * 【なぜ "index" という名前なのか — Webの歴史】
 * ============================================================
 *
 * ■ "index" の語源:
 *   英語の "index"（索引・目次）に由来する。
 *   図書館の「索引カード」が本を探す入口であるように、
 *   index ファイルはディレクトリの「入口」「トップページ」を意味する。
 *
 * ■ 歴史的経緯:
 *   1. 1990年代初頭（Webの黎明期）:
 *      Webサーバー（Apache等）はURLにファイル名が指定されていない場合、
 *      そのディレクトリの「index.html」を自動的に返す仕様だった。
 *      例: http://example.com/ → /var/www/html/index.html を返す
 *
 *   2. なぜ "index" が選ばれたか:
 *      Apache HTTP Server の設定 "DirectoryIndex" のデフォルト値が index.html。
 *      NCSAサーバー（Apacheの前身、1993年〜）の時代からこの慣習があった。
 *      「ディレクトリの内容一覧（index）」を表示するページという発想。
 *
 *   3. 現代のフレームワーク:
 *      - Next.js: pages/index.tsx → "/"
 *      - Expo Router: app/index.tsx → "/"
 *      - Python: __init__.py（同じ概念だが名前が違う）
 *      - Node.js: index.js（require("./module") → ./module/index.js）
 *      → 全て「ディレクトリのデフォルトファイル」という同じ概念。
 *
 * ■ このファイルの役割:
 *   src/app/index.tsx は "/" に対応する。
 *   ユーザーが最初にアプリを開いたとき（URLが "/" のとき）このファイルが表示される。
 *   デモ版ではログイン画面に直接リダイレクトする。
 */

import React from "react";
// Redirect: 指定したパスに即座にリダイレクトするExpo Routerコンポーネント
import { Redirect } from "expo-router";

/**
 * Index: ルートページコンポーネント。
 * "/" にアクセスされたらログイン画面 /(auth)/login にリダイレクトする。
 */
export default function Index() {
  // Redirect: レンダリングされると即座に href に遷移する
  return <Redirect href="/(auth)/login" />;
}
