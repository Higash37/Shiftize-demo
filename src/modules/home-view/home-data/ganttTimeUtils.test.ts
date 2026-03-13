/**
 * @file ganttTimeUtils.test.ts
 * @description ガントチャート時間ユーティリティのユニットテスト。
 *   ゼロパディング関数と時間スロット配列の生成を検証する。
 */

import { pad, allTimes } from "./ganttTimeUtils";

describe("ganttTimeUtils", () => {
  // --- pad（ゼロパディング）---
  describe("pad（ゼロパディング）", () => {
    it("1桁の数値をゼロパディングする", () => {
      expect(pad(0)).toBe("00");
      expect(pad(1)).toBe("01");
      expect(pad(9)).toBe("09");
    });

    it("2桁の数値はそのまま返す", () => {
      expect(pad(10)).toBe("10");
      expect(pad(23)).toBe("23");
      expect(pad(99)).toBe("99");
    });

    it("3桁以上の数値もそのまま返す（切り捨てしない）", () => {
      expect(pad(100)).toBe("100");
    });
  });

  // --- allTimes（時間スロット配列）---
  describe("allTimes（時間スロット配列）", () => {
    it("配列の長さは49（0:00〜24:00の30分刻み: 24*2 + 1）", () => {
      expect(allTimes).toHaveLength(49);
    });

    it("最初の要素は '00:00'", () => {
      expect(allTimes[0]).toBe("00:00");
    });

    it("最後の要素は '24:00'", () => {
      expect(allTimes[allTimes.length - 1]).toBe("24:00");
    });

    it("30分刻みで正しく生成されている", () => {
      // 代表的なポイントを確認
      expect(allTimes[1]).toBe("00:30");
      expect(allTimes[2]).toBe("01:00");
      expect(allTimes[3]).toBe("01:30");
      expect(allTimes[18]).toBe("09:00");  // index 18 = 9*2
      expect(allTimes[19]).toBe("09:30");
    });

    it("全ての要素が 'HH:MM' フォーマットに一致する", () => {
      const timeFormat = /^\d{2}:\d{2}$/;
      allTimes.forEach((time) => {
        expect(time).toMatch(timeFormat);
      });
    });

    it("時間が昇順に並んでいる", () => {
      for (let i = 0; i < allTimes.length - 1; i++) {
        expect(allTimes[i]! < allTimes[i + 1]!).toBe(true);
      }
    });

    it("重複する時間がない", () => {
      const uniqueTimes = new Set(allTimes);
      expect(uniqueTimes.size).toBe(allTimes.length);
    });
  });
});
