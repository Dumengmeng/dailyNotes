## git操作常见问题收集
**1. fatal: refusing to merge unrelated histories**
* 【原因】git push或git merge的时候，可能会遇到这个报错，这可能是因为两个分支没有取得联系
* 【解决】在命令后边加 --allow-unrelated-histories 即可