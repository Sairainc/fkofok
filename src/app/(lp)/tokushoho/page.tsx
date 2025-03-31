import React from 'react';

const TokushohoPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8 text-center">特定商取引法に基づく表記</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">事業者情報</h2>
        <dl className="space-y-2">
          <div>
            <dt className="font-medium">事業者名：</dt>
            <dd>コンパる</dd>
          </div>
          <div>
            <dt className="font-medium">代表者：</dt>
            <dd>大河原 徳人</dd>
          </div>
          <div>
            <dt className="font-medium">運営組織：</dt>
            <dd>コンパる運営事務局</dd>
          </div>
          <div>
            <dt className="font-medium">所在地：</dt>
            <dd>東京都北区中里1-15-2</dd>
          </div>
          <div>
            <dt className="font-medium">お問い合わせ先：</dt>
            <dd>inf@comparu.net</dd>
          </div>
        </dl>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">サービス内容</h2>
        <dl className="space-y-2">
          <div>
            <dt className="font-medium">提供サービス：</dt>
            <dd>AIを活用した恋活・婚活マッチングサービス</dd>
          </div>
        </dl>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">料金について</h2>
        <dl className="space-y-2">
          <div>
            <dt className="font-medium">サービスの対価：</dt>
            <dd>公式LINEにてご案内いたします。</dd>
          </div>
          <div>
            <dt className="font-medium">追加費用：</dt>
            <dd>インターネット通信費は、お客様のご負担となります（契約されている通信事業者の料金に準じます）。</dd>
          </div>
        </dl>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">お支払い方法</h2>
        <p>クレジットカード決済（VISA / MasterCard / JCB / Amex）</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">キャンセルポリシー</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>キャンセルはキャンセル規約に基づき対応いたします。</li>
          <li>デートの手配後または確定後にキャンセルされる場合、所定のキャンセル料が発生します。</li>
          <li>既にお支払いいただいた月額料金およびチケット料金の返金は対応いたしかねます。</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">特記事項</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>本サービスは「インターネット異性紹介事業届出済」です。</li>
          <li>受理番号：石神井25-015145</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">推奨動作環境</h2>
        <p>Webブラウザ</p>
      </section>
    </div>
  );
};

export default TokushohoPage; 