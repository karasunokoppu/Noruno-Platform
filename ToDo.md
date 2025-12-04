# TO DO List

- [X] 通知システムの削除
- [X] タスクグループの作成・削除機能
- [ ] タスクの優先順位の設定を実装
- [x] テーマのバリエーションを直す
- [x] 読書メモ機能を実装
- [ ] タスクグループにも詳細メモを残せるように
- [ ] UI        : shadcn/ui + Tailwind
- [ ] 状態管理  : Zustand
- [ ] データ保存: Tauri (SQLite or JSON)
- [ ] エディタ  : シンプルな textarea → 後で拡張可
- [ ] 通信     : @tauri-apps/api (invoke)
- [ ] Taur plugin (Single Instance)を使ってみる。(アプリを同時に一つだけ実行する用制限する)

# 確認事項

- [X] データのセーブはどのように実装されている？

# メモ

- セーブデータの場所
'~/.local/share/com.noruno.platform/'

- gmail通知の設定
    1. 2段階認証をONに
    2. Googleアカウントの「アプリパスワード」画面でパスワードを生成
    3. 生成したパスワードを設定
    <https://myaccount.google.com/apppasswords?continue=https://myaccount.google.com/security?rapt%3DAEjHL4MScLROKznUs9Fzt8B8krfH7Tyx_RuNH3CZGbdJl4gqd8gheofSOqbiFVX9kvYOaBHqxWeaFZIRmKPPq1FpZ6lGrLIgoBKLKw2XldsTT6f9SQeoq20&rapt=AEjHL4MASYksQI4B1RCr2M15VmMOKpdPIDn8In0cgnWpceoCIC87Gf24cLgKtE6ZMLGZ-Ffst31bmtkFxxzz-q5MSzhb9sRp-dpyFxm82HeXbYdJpuiSbng>
