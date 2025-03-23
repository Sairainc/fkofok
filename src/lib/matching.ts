import { supabase } from './supabase';

export const findMatch = async (preferredDate: string) => {
  try {
    const { data: maleCandidates, error: maleError } = await supabase
      .from('men_preferences')
      .select('line_id, datetime, party_type')
      .eq('datetime', preferredDate)
      .order('created_at')
      .limit(2);

    if (maleError) throw maleError;
    if (!maleCandidates) return { success: false, message: '男性の候補が見つかりませんでした' };

    const { data: femaleCandidates, error: femaleError } = await supabase
      .from('women_preferences')
      .select('line_id, datetime, party_type')
      .eq('datetime', preferredDate)
      .order('created_at')
      .limit(2);

    if (femaleError) throw femaleError;
    if (!femaleCandidates) return { success: false, message: '女性の候補が見つかりませんでした' };

    // マッチング条件をチェック
    if (maleCandidates.length === 2 && femaleCandidates.length === 2) {
      // パーティータイプが一致するかチェック
      const partyTypeMatches = maleCandidates[0].party_type === maleCandidates[1].party_type &&
                              femaleCandidates[0].party_type === femaleCandidates[1].party_type &&
                              maleCandidates[0].party_type === femaleCandidates[0].party_type;

      if (partyTypeMatches) {
        // マッチングを記録
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            male_user_1: maleCandidates[0].line_id,
            male_user_2: maleCandidates[1].line_id,
            female_user_1: femaleCandidates[0].line_id,
            female_user_2: femaleCandidates[1].line_id,
            match_date: preferredDate,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (matchError) throw matchError;

        // マッチング成功を通知
        return {
          success: true,
          match: {
            males: [maleCandidates[0].line_id, maleCandidates[1].line_id],
            females: [femaleCandidates[0].line_id, femaleCandidates[1].line_id],
            date: preferredDate
          }
        };
      }
    }

    // マッチング条件を満たさない場合
    return {
      success: false,
      message: 'マッチング条件を満たすユーザーが見つかりませんでした'
    };

  } catch (error) {
    console.error('マッチングエラー:', error);
    return {
      success: false,
      message: 'マッチング処理中にエラーが発生しました',
      error
    };
  }
}; 