// entry/src/main/ets/views/settings/SettingsSheetView.ets
import { CalcConstants } from '../../common/CalcConstants';

@Component
export struct SettingsSheetView {
  @Link currentThemeColor: string;
  onClearHistory: () => void = (): void => {};

  build() {
    Column({ space: 24 }) {
      Text('个性化偏好设置')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .fontColor(CalcConstants.COLOR_TEXT_PRIMARY)
        .width('100%')

      // 主题色彩切换
      Column({ space: 12 }) {
        Text('选择主题强调色')
          .fontSize(15)
          .fontColor(CalcConstants.COLOR_TEXT_SECONDARY)
          .width('100%')

        Row({ space: 16 }) {
          this.ThemeOption('海大经典蓝', CalcConstants.COLOR_OUC_NAVY)
          this.ThemeOption('极简活力蓝', CalcConstants.COLOR_PRIMARY_BLUE)
          this.ThemeOption('暗夜深邃黑', CalcConstants.COLOR_DARK_MODE)
        }
        .width('100%')
      }

      Divider().color('#EBECEF')

      // 数据管理
      Column({ space: 12 }) {
        Text('数据与存储管理')
          .fontSize(15)
          .fontColor(CalcConstants.COLOR_TEXT_SECONDARY)
          .width('100%')

        Button('清空所有历史计算记录')
          .backgroundColor('#FEE2E2')
          .fontColor('#DC2626')
          .fontSize(15)
          .width('100%')
          .height(44)
          .onClick((): void => {
            this.onClearHistory();
          })
      }

      Divider().color('#EBECEF')

      // 关于信息
      Column({ space: 6 }) {
        Row() {
          Text('应用版本').fontSize(15).fontColor(CalcConstants.COLOR_TEXT_PRIMARY)
          Blank()
          Text('Super Calculator v2.0-Final').fontSize(14).fontColor(CalcConstants.COLOR_TEXT_SECONDARY)
        }.width('100%')

        Row() {
          Text('技术标准').fontSize(15).fontColor(CalcConstants.COLOR_TEXT_PRIMARY)
          Blank()
          Text('HarmonyOS NEXT ArkTS 规范').fontSize(14).fontColor(CalcConstants.COLOR_TEXT_SECONDARY)
        }.width('100%')
      }
    }
    .width('100%')
    .padding({ left: 24, right: 24, top: 20, bottom: 24 })
  }

  @Builder
  ThemeOption(name: string, colorHex: string) {
    Column({ space: 6 }) {
      Row()
        .width(36)
        .height(36)
        .borderRadius(18)
        .backgroundColor(colorHex)
        .border({
          width: this.currentThemeColor === colorHex ? 3 : 0,
          color: '#FFFFFF'
        })
        .shadow(this.currentThemeColor === colorHex ? { radius: 6, color: colorHex } : { radius: 0, color: Color.Transparent })

      Text(name)
        .fontSize(12)
        .fontColor(this.currentThemeColor === colorHex ? colorHex : CalcConstants.COLOR_TEXT_SECONDARY)
        .fontWeight(this.currentThemeColor === colorHex ? FontWeight.Bold : FontWeight.Normal)
    }
    .onClick((): void => {
      this.currentThemeColor = colorHex;
    })
  }
}