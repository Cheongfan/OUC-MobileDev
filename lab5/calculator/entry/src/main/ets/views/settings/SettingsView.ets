// entry/src/main/ets/views/settings/SettingsView.ets
import { AppColorSystem } from '../../common/CalcConstants';

@Component
export struct SettingsView {
  @Link isDarkMode: boolean;
  @Link primaryColor: string;
  @Link isVibrateEnabled: boolean;

  onBack: () => void = (): void => {};
  onClearAllHistory: () => void = (): void => {};

  build() {
    Column() {
      // 1. 顶部标题栏
      Row() {
        Button('‹ 返回')
          .backgroundColor(Color.Transparent)
          .fontColor(this.primaryColor)
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .onClick((): void => {
            this.onBack();
          })

        Blank()

        Text('设置')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(AppColorSystem.getTextPrimary(this.isDarkMode))

        Blank()
        Stack().width(60)
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 44, bottom: 12 })

      // 2. 设置选项列表
      Scroll() {
        Column({ space: 20 }) {
          // 分组 1: 外观与沉浸主题
          Column({ space: 8 }) {
            Text('外观与主题')
              .fontSize(13)
              .fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
              .padding({ left: 8 })

            Column() {
              this.SettingSwitchRow('黑夜模式 (纯黑调色)', this.isDarkMode, (val: boolean): void => {
                this.isDarkMode = val;
              })
              Divider().color(AppColorSystem.getBorderColor(this.isDarkMode)).margin({ left: 16, right: 16 })
              this.ThemeColorPickerRow()
            }
            .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
            .borderRadius(16)
          }
          .width('100%')
          .alignItems(HorizontalAlign.Start)

          // 分组 2: 交互与反馈
          Column({ space: 8 }) {
            Text('交互与触觉')
              .fontSize(13)
              .fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
              .padding({ left: 8 })

            Column() {
              this.SettingSwitchRow('按键轻微触感震动', this.isVibrateEnabled, (val: boolean): void => {
                this.isVibrateEnabled = val;
              })
            }
            .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
            .borderRadius(16)
          }
          .width('100%')
          .alignItems(HorizontalAlign.Start)

          // 分组 3: 存储管理
          Column({ space: 8 }) {
            Text('数据与历史')
              .fontSize(13)
              .fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
              .padding({ left: 8 })

            Column() {
              this.SettingActionRow('清空所有计算与位运算历史记录', '#EF4444', (): void => {
                this.onClearAllHistory();
              })
            }
            .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
            .borderRadius(16)
          }
          .width('100%')
          .alignItems(HorizontalAlign.Start)

          // 分组 4: 关于应用
          Column({ space: 8 }) {
            Text('关于')
              .fontSize(13)
              .fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
              .padding({ left: 8 })

            Column() {
              this.SettingInfoRow('工程名称', '多功能计算器')
              Divider().color(AppColorSystem.getBorderColor(this.isDarkMode)).margin({ left: 16, right: 16 })
              this.SettingInfoRow('版本号', 'v3.0 Ultra Release')
              Divider().color(AppColorSystem.getBorderColor(this.isDarkMode)).margin({ left: 16, right: 16 })
              this.SettingInfoRow('技术规范', 'HarmonyOS NEXT ArkTS')
            }
            .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
            .borderRadius(16)
          }
          .width('100%')
          .alignItems(HorizontalAlign.Start)
        }
        .padding({ left: 16, right: 16, bottom: 40 })
      }
      .layoutWeight(1)
      .width('100%')
      .edgeEffect(EdgeEffect.Spring)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(AppColorSystem.getPageBg(this.isDarkMode))
    .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM])
  }

  @Builder
  SettingSwitchRow(label: string, value: boolean, onChangeAction: (val: boolean) => void) {
    Row() {
      Text(label)
        .fontSize(16)
        .fontColor(AppColorSystem.getTextPrimary(this.isDarkMode))
      Blank()
      Toggle({ type: ToggleType.Switch, isOn: value })
        .selectedColor(this.primaryColor)
        .onChange((isOn: boolean): void => {
          onChangeAction(isOn);
        })
    }
    .width('100%')
    .padding(16)
  }

  @Builder
  ThemeColorPickerRow() {
    Row() {
      Text('强调色')
        .fontSize(16)
        .fontColor(AppColorSystem.getTextPrimary(this.isDarkMode))
      Blank()
      Row({ space: 12 }) {
        this.ColorCircle('#004B97') // 海大蓝
        this.ColorCircle('#2F65EE') // 极简蓝
        this.ColorCircle('#10B981') // 翡翠绿
        this.ColorCircle('#F59E0B') // 活力橙
      }
    }
    .width('100%')
    .padding(16)
  }

  @Builder
  ColorCircle(hex: string) {
    Stack({ alignContent: Alignment.Center }) {
      if (this.primaryColor === hex) {
        Text('✓').fontSize(14).fontColor('#FFFFFF').fontWeight(FontWeight.Bold)
      }
    }
    .width(28)
    .height(28)
    .borderRadius(14)
    .backgroundColor(hex)
    .onClick((): void => {
      this.primaryColor = hex;
    })
  }

  @Builder
  SettingActionRow(label: string, color: string, action: () => void) {
    Row() {
      Text(label)
        .fontSize(16)
        .fontColor(color)
      Blank()
      Text('›').fontSize(20).fontColor(color)
    }
    .width('100%')
    .padding(16)
    .onClick((): void => {
      action();
    })
  }

  @Builder
  SettingInfoRow(label: string, info: string) {
    Row() {
      Text(label)
        .fontSize(16)
        .fontColor(AppColorSystem.getTextPrimary(this.isDarkMode))
      Blank()
      Text(info)
        .fontSize(14)
        .fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
    }
    .width('100%')
    .padding(16)
  }
}