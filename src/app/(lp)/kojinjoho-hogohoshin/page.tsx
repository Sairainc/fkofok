import React from 'react';

const KojinjohoHogohoshinPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8 text-center">個人情報及び特定個人情報保護方針</h1>

      <p className="mb-6">
        コンパる（以下「当社」）は、インターネット異性紹介事業を運営する企業として、お客様や従業員などからお預かりする個人情報および特定個人情報の適切な取り扱いと保護を徹底することが、社会的責務であると考えています。
      </p>
      <p className="mb-6">
        また、個人情報の保護によりお客様に安心してサービスをご利用いただくことは、当社の事業活動における重要な基本方針の一つです。
      </p>
      <p className="mb-8">
        この責任を果たすため、当社は以下の**「個人情報および特定個人情報保護方針」**を定め、全社を挙げて取り組んでまいります。
      </p>

      <ol className="list-decimal list-inside space-y-6 mb-8">
        <li>
          <h2 className="inline font-semibold">個人情報の取得・利用・提供について</h2>
          <p className="mt-2 pl-4">
            当社は、業務の遂行および従業員の雇用・人事管理に必要な範囲でのみ、個人情報および特定個人情報を取得・利用・提供します。取得の際は、利用目的を明示または公表し、目的外の利用を防ぐための対策を実施します。
            また、業務委託により取得した個人情報も厳格に管理し、契約の範囲内でのみ利用します。
          </p>
        </li>
        <li>
          <h2 className="inline font-semibold">法令・規範の遵守</h2>
          <p className="mt-2 pl-4">
            当社は、個人情報および特定個人情報の取り扱いに関する法令、国の指針、その他の規範を遵守します。
          </p>
        </li>
        <li>
          <h2 className="inline font-semibold">安全管理の徹底</h2>
          <p className="mt-2 pl-4">
            個人情報への不正アクセスや、情報の紛失・破壊・改ざん・漏えいを防ぐため、合理的な安全対策を講じるとともに、必要に応じて是正措置を行います。
          </p>
        </li>
        <li>
          <h2 className="inline font-semibold">適切な管理体制</h2>
          <p className="mt-2 pl-4">
            当社は、個人情報および特定個人情報の管理責任者を任命し、適切な管理体制を整えます。また、個人情報保護マネジメントシステムを運用し、継続的な改善を行います。
          </p>
        </li>
        <li>
          <h2 className="inline font-semibold">継続的な改善</h2>
          <p className="mt-2 pl-4">
            当社は、教育・監査・運用の見直しを通じて、個人情報保護マネジメントシステムの継続的な改善を行います。
          </p>
        </li>
        <li>
          <h2 className="inline font-semibold">お問い合わせ対応</h2>
          <p className="mt-2 pl-4">
            当社は、保有個人データの利用目的の通知、開示、第三者提供記録の開示、内容の訂正・追加・削除、利用の停止・消去、第三者提供の停止に関するお問い合わせや苦情・相談を受け付ける窓口を設置し、適切に対応いたします。
          </p>
        </li>
      </ol>

      <div className="text-right space-y-1">
        <p>最終改定日：2025年3月10日</p>
        <p>所在地：東京都北区中里1-15-2</p>
        <p>会社名：コンパる</p>
        <p>事業代表者：大河原 徳人</p>
      </div>
    </div>
  );
};

export default KojinjohoHogohoshinPage; 