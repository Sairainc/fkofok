'use client'

export const ComparisonTable = () => {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center mb-12">従来の合コンと比較</h2>
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="font-bold">比較項目</div>
          <div className="font-bold text-primary">コンパる</div>
          <div className="font-bold text-gray-500">従来の合コン</div>
          
          {[
            ['参加人数', '1人から可能', '複数人必要'],
            ['日程調整', '不要', '必要'],
            ['場所決め', 'AI自動設定', '手動で調整'],
            ['キャンセル', '柔軟に対応', '困難'],
          ].map(([item, ours, theirs]) => (
            <>
              <div>{item}</div>
              <div>{ours}</div>
              <div>{theirs}</div>
            </>
          ))}
        </div>
      </div>
    </section>
  )
} 