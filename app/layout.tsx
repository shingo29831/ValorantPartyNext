// src/app/layout.tsx
// AI Role: サイト全体のレイアウトとSEOメタデータ定義
// 役割: HTMLの基本構造と、検索エンジン向けのメタデータを提供する

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Valorant Party - Random Team & Strategy Generator',
  description: 'Valorantのカスタムマッチ向けランダムチーム分け、エージェント、武器、ルールの自動ジェネレーターです。',
  keywords: 'Valorant, randomizer, custom match, team generator, ヴァロラント, チーム分け, ランダム',
  openGraph: {
    title: 'Valorant Party',
    description: 'Valorantのカスタムマッチ向けランダムチーム分けツール',
    url: 'https://valorant-party.vercel.app', // ※実際の公開URLに変更してください
    siteName: 'Valorant Party',
    locale: 'ja_JP',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      {/* <body>タグにアプリ全体で使うTailwindのベースカラーを適用 */}
      <body className="bg-val-dark text-val-light antialiased">
        {children}
      </body>
    </html>
  );
}