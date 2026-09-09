// entry/src/main/ets/common/CalcConstants.ets

/**
 * 计算器按键类型枚举
 */
export enum KeyType {
  NUMBER,
  OPERATOR,
  ACTION,
  MEMORY,
  SCIENTIFIC,
  EQUAL
}

/**
 * 运算模式
 */
export enum CalcMode {
  STANDARD,
  SCIENTIFIC,
  PROGRAMMER
}

/**
 * 基础样式与符号常量 (保证旧组件兼容)
 */
export class CalcConstants {
  // 基础运算符
  public static readonly OP_ADD: string = '+';
  public static readonly OP_SUB: string = '-';
  public static readonly OP_MUL: string = '×';
  public static readonly OP_DIV: string = '÷';
  public static readonly OP_PERCENT: string = '%';
  public static readonly OP_EQUAL: string = '=';
  public static readonly OP_BACKSPACE: string = '←';

  // 经典色彩
  public static readonly COLOR_PRIMARY_BLUE: string = '#2F65EE';
  public static readonly COLOR_OUC_NAVY: string = '#004B97';
  public static readonly COLOR_DARK_MODE: string = '#1E1E24';

  // 页面色彩
  public static readonly COLOR_TEXT_PRIMARY: string = '#1F2329';
  public static readonly COLOR_TEXT_SECONDARY: string = '#8F959E';
  public static readonly COLOR_TEXT_MUTED: string = '#BCC1CC';
  public static readonly COLOR_BG_PAGE: string = '#F8F9FB';
  public static readonly COLOR_BG_CARD: string = '#F2F3F5';
  public static readonly COLOR_WHITE: string = '#FFFFFF';
}

/**
 * 主题配置接口 (保证科学/标准键盘组件兼容)
 */
export interface ThemeConfig {
  id: string;
  name: string;
  primaryColor: string;
  pageBgColor: string;
  cardBgColor: string;
  textColorPrimary: string;
  textColorSecondary: string;
  keyBgColor: string;
  isDark: boolean;
}

/**
 * 全局预设主题数据库
 */
export class ThemeManager {
  public static readonly THEME_LIGHT: ThemeConfig = {
    id: 'light',
    name: '极简白',
    primaryColor: '#2F65EE',
    pageBgColor: '#F8F9FB',
    cardBgColor: '#FFFFFF',
    textColorPrimary: '#1F2329',
    textColorSecondary: '#8F959E',
    keyBgColor: '#EBECEF',
    isDark: false
  };

  public static readonly THEME_OUC: ThemeConfig = {
    id: 'ouc',
    name: '中国海大蓝',
    primaryColor: '#004B97',
    pageBgColor: '#F0F4FA',
    cardBgColor: '#FFFFFF',
    textColorPrimary: '#0C1C2C',
    textColorSecondary: '#627D98',
    keyBgColor: '#E2E8F0',
    isDark: false
  };

  public static readonly THEME_DARK: ThemeConfig = {
    id: 'dark',
    name: '极客暗夜黑',
    primaryColor: '#3B82F6',
    pageBgColor: '#000000',
    cardBgColor: '#18181C',
    textColorPrimary: '#FFFFFF',
    textColorSecondary: '#8E8E93',
    keyBgColor: '#26262C',
    isDark: true
  };
}

/**
 * 单位换算支持的数据项
 */
export interface UnitItem {
  name: string;
  factorToBase: number;
}

export class UnitData {
  public static readonly LENGTH_UNITS: UnitItem[] = [
    { name: '米 (m)', factorToBase: 1.0 },
    { name: '厘米 (cm)', factorToBase: 0.01 },
    { name: '毫米 (mm)', factorToBase: 0.001 },
    { name: '千米 (km)', factorToBase: 1000.0 },
    { name: '英寸 (in)', factorToBase: 0.0254 },
    { name: '英尺 (ft)', factorToBase: 0.3048 },
    { name: '码 (yd)', factorToBase: 0.9144 }
  ];

  public static readonly WEIGHT_UNITS: UnitItem[] = [
    { name: '千克 (kg)', factorToBase: 1.0 },
    { name: '克 (g)', factorToBase: 0.001 },
    { name: '斤', factorToBase: 0.5 },
    { name: '公斤', factorToBase: 1.0 },
    { name: '磅 (lb)', factorToBase: 0.453592 },
    { name: '盎司 (oz)', factorToBase: 0.0283495 }
  ];

  public static readonly AREA_UNITS: UnitItem[] = [
    { name: '平方米 (㎡)', factorToBase: 1.0 },
    { name: '平方厘米 (c㎡)', factorToBase: 0.0001 },
    { name: '平方公里 (k㎡)', factorToBase: 1000000.0 },
    { name: '公顷 (ha)', factorToBase: 10000.0 },
    { name: '亩', factorToBase: 666.6667 }
  ];
}

/**
 * 动态沉浸式色彩管理系统 (黑夜/白天无缝支持)
 */
export class AppColorSystem {
  public static getPageBg(isDark: boolean): string {
    return isDark ? '#000000' : '#F8F9FB';
  }

  public static getCardBg(isDark: boolean): string {
    return isDark ? '#18181C' : '#FFFFFF';
  }

  public static getTextPrimary(isDark: boolean): string {
    return isDark ? '#FFFFFF' : '#1F2329';
  }

  public static getTextSecondary(isDark: boolean): string {
    return isDark ? '#8E8E93' : '#8F959E';
  }

  public static getKeyBg(isDark: boolean): string {
    return isDark ? '#26262C' : '#F3F4F6';
  }

  public static getBorderColor(isDark: boolean): string {
    return isDark ? '#2C2C34' : '#EBECEF';
  }
}