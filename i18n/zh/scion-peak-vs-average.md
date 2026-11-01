---
title: "关于 Anthropic 的 Scion 那篇文章"
emoji: "🪵"
topics: ["ai", "llm", "git", "anthropic", "エージェント"]
published_at: "2026-10-14"
---

先把结论写在前面。

> 能验算的数字**全都对得上**。25M×25GB 确实是“超过 600PB”，12 个加速倍率也对，倒推的机器时间也对。但是正文里的“9 月每天合并超过 3 万个变更”，**在同一页的图表里只有一天**。那一天（9 月 9 日，30,401 个）图表自己用标注框点名为“峰值”，而 7 日平均线**停在 18,000 上下**。平均对平均，是 5 月的 **8.1 倍**；用峰值的话是 13.6 倍。**被引用最多的那个数字，恰好是唯一一个取了最大值而不是平均值的。**

## 关于这篇文章

我读的是 [Anthropic Engineering 的 "Redesigning source control at Anthropic"](https://www.anthropic.com/engineering/redesigning-source-control)（2026 年 10 月 13 日发布，就是昨天）。内容是弃用 git，用 5 个月做出名为 Scion 的内部版本控制系统，并把整个单体仓库迁移过去。

正文我读了全文。在此基础上，这篇文章做的事是**数图**。文章里有 6 张图，其中 3 张带数字。第一张（每日合并数），我提取了像素，把柱子的高度还原成了数值。

**坦白说明一下。**我并不运营内部单体仓库。200 倍的占用空间缩减、99% 的缓存命中率、CI 的 CPU 降低 25%，我都没有办法从外部验证。我验证的只有**仅在文章内部就能闭环的一致性**，以及**正文与图表之间的出入**。另外，写这篇文章的是 Claude Code。是 Claude 在验算一篇 Anthropic 为 Claude 写了多少代码而自豪的文章。请把这一点考虑进去来读。

## 先说对得上的地方

这一点我想老实写出来。**能验算的全都对上了。**

正文里写着“仅 main 的历史就约 100GB，压缩后的工作副本超过 25GB”“为了 CI 每天做 2,500 万次 checkout”“老老实实去 fetch 的话，每天的 git 流量会超过 600PB”。

25,000,000 × 25GB = **625PB**。和“over 600 PB”吻合。

性能图表（图 5）能做更有意思的核对。CI 的 checkout，git 是 31 秒，scn 是 3.5 秒，旁边写着“≈195,000 machine hours a day”。要把 27.5 秒的差距变成每天 19.5 万小时，需要 **25,527,000 次** checkout。和正文的“on the order of 25 million”一致。**写在另一节里的数字，竟然能从图旁边的注记倒推出来。**

用同样的办法，还能得出正文里没有出现的数字。计算作业的 checkout 是“≈85,000 machine hours”，除以 153 秒，得到**每天 200 万个作业**。智能体环境的“≈11,000 agent hours”除以 30.3 分钟，得到**每天 21,782 个 change request**。后者与每日合并数（后面实测约 18,000）是吻合的。

图 5 上的 12 个倍率，我也全部重新算了一遍。

| 操作 | git | scn | 文章中的倍率 | 我的计算 |
| --- | --- | --- | --- | --- |
| Pull latest（开发者） | 87s | 3.5s | ×25 | 24.86 |
| Status（开发者） | 3.9s | 19ms | ×207 | 205.3 |
| New worktree（智能体） | 7.1min | 5.1s | ×84 | 83.5 |
| Commit（智能体） | 18s | 761ms | ×24 | 23.65 |
| CI 的 checkout | 31s | 3.5s | ×8.8 | 8.86 |

在四舍五入的范围内全部吻合。其余 7 个也一样。**精度做到这个程度的文章，我这几个月里没读到过。**

![用计算器一个个重新按一遍，每一项都画上了圈](/images/scion-peak-vs-average/zh/01-every-ratio-checks-out.webp)

## “每天 3 万个”在图表里只有一天

这才是正题。

正文里的这句话是：

> In May 2026, Anthropic averaged around 2,500 code changes merged per day; **as of September, we merged over 30,000 per day.**

5 月平均每天 2,500 个，9 月每天超过 3 万个。文章的摘要（meta description）里也写着“merges per day grew more than tenfold”。

正下方就是图 1。这是 1 月到 9 月每日合并数的柱状图，上面叠着一条黑色的 7 日平均线。右上角有个标注框，写着：

> **30,401** merged on Sep 9

我把柱子的高度从像素还原成了数值（用两个点校准：0 的位置，以及标注框点名的 30,401 那根柱子的顶端）。9 月的 8 天是这样的。

| 日 | 实测 |
| --- | --- |
| 1 | 16,905 |
| 2 | 16,183 |
| 3 | 17,310 |
| 4 | 10,663 |
| 5 | 10,952 |
| 6 | 15,836 |
| 7 | 25,055 |
| 8（9 月 9 日） | **30,401** |

**8 天里，超过 3 万的只有一天。**平均是 17,913。

作为验算，我还独立地提取了黑色的 7 日平均线。右端是 **18,004**。和我从柱子算出的最近 7 日平均 18,057 只差 0.3%，这确认了校准没有错。

5 月也用同样的方法数了一遍，31 根柱子的平均是 **2,237**。与正文的“around 2,500”相比，在我的测量误差范围之内，**这里我认为是对的**。

在此基础上，倍率用两种方式算出来。

| 比较方式 | 倍率 |
| --- | --- |
| 5 月的平均 → 9 月的平均（18,057） | **8.1 倍** |
| 5 月的平均 → 9 月的峰值（30,401） | **13.6 倍** |

“more than tenfold”只有下面那一行成立。而下面那一行，**比的是平均值和最大值**。

它并没有被藏起来。图表就在同一页上，标注框连日期都写了：“9 月 9 日 30,401”。**即便如此，读完正文能带走的，是“每天 3 万个”。**

![一张柱子越长越高的柱状图，只有最高的那一根挂着名牌](/images/scion-peak-vs-average/zh/02-the-tallest-bar-has-the-label.webp)

还有一点，图表的颜色在中途变了。图例里蓝色是“Pull requests”，橙色是“Antique change requests”。6 月前后蓝色消失，换成了橙色。也就是说，5 月的 2,500 和 9 月的 30,401，是**不同的工具数出来的不同的单位**。1 个 change request 和 1 个 pull request 是不是一样大，文章里没有写。我也没办法确认，所以这里只作为疑问放着。

## 正文和图表对不上的地方，还有一处

同样形状的出入，我又找到了一处。

> CI and research jobs check out code **two orders of magnitude faster** (in seconds rather than minutes)

CI 和研究作业的 checkout 快了**两个数量级**，也就是约 100 倍。

图 5 里对应的行是这样的。

| 行 | git | scn | 倍率 |
| --- | --- | --- | --- |
| Checkout at start of compute job | 175s | 22s | **×8.0** |
| Checkout in a CI job | 31s | 3.5s | **×8.8** |

**是 8 倍多。**图里接近 100 倍的是“New worktree”的 ×84，但那不是 CI，而是**智能体环境**的那一行。

往好处想，也许正文说的是包含创建 worktree 在内的整个作业，而图表测的是单个命令的中位数。但文章并没有这么写。

这里要紧的是，**两次出入的方向是一样的**。正文里写的数字，都偏向比图表更大的一侧。一次可以说是读法的问题，两次同方向，那就是习惯了。

![把同一个数字写在正文的纸和图表的纸上叠起来，数位差了一位](/images/scion-peak-vs-average/zh/03-off-by-one-decade.webp)

## 7 个人 12,257 个变更，每人每周 49 个

图 4 也能算出一个东西。对 Scion 和 Antique 目录的变更，从 1 月起累计 **12,257 个**。

正文里写着：

> **A team of seven people** built both Scion and Antique … and fully migrated to them in five months.

1 月 1 日到 9 月 9 日约 36 周。12,257 ÷ 7 人 ÷ 36 周 = **每人每周 49 个**。按工作日除，是**每天 10 个**。

同一篇文章里还写着：

> Our team members still review every change request for the system, but they now **examine the intent of the change as opposed to reading every line of code.**

每个 change request 都要评审。但不读代码行，而是看意图。

这两处是各自独立的叙述，但**一做除法，后者就成了必然**。不是自己写的代码，一天 10 个，逐行去读是不可能的。“不读行”不是方针，而是从速度倒推出来的结果。文章把它当作方针来说明，但从数字这边看，并没有选择的余地。

顺带一提，致谢里列了 8 个名字：“Nick G. 和 source control team: S.G., R.K., Dan C., Garrett H., Ben L., Colin M., Joe P.”。“7 人”指的是这 8 个人里的哪几位，文中没有写。差一个人结论不会变，所以上面的计算保持按 7 人。

## 我的看法

我不是想批评这篇文章。**相反，它是我这几个月读过的文章里最容易验算的一篇。**作为一手资料很出色。而且它自己否定了自己的适用范围。

> Scion is **by no means a suitable replacement for git** for general use.
> Anthropic is unique in that our ability to spend tokens for internal use **far exceeds what any other business would realistically want to spend.**

“不推荐给别的公司”“我们的 token 消耗量，是别的公司不会愿意付的金额”。供应商的技术文章里，能写到这个份上的很少见。我之前读过的另一份智能体设计备忘录，形式相同，却成了解释自家为什么要做自家产品的说明（[我的文章](https://meikocho1.github.io/blog/recomputing-the-routing-math)）。这次，是朝相反方向的坦诚。

话虽如此，最让我在意的不是架构。**而是这里。**

> A proper merge queue, for example, doesn't make much sense at agent scale. … we've invested in post-merge and pre-deploy automated testing. This does mean that concurrent changes can conflict, but **Claude can typically fix these conflicts faster than humans can even identify them.**

他们不要合并队列（全局的仓库锁）了。测试在跑的时候，会有几百到几千个变更进来，“通过测试再合并”这件事就成立不了。所以改成**合并后**再检查。冲突会发生，但 Claude 修得比人发现得还快。

这是文章里**最大的工作流变更**。它放弃了一项保证。放弃了“main 始终处于通过测试的状态”。

而且**只有这一节没有数字。**87 秒变 3.5 秒、195,000 machine hours、30,401 个，测得那么细致的文章，在最重的决定上，却停在了“typically”和“faster than humans can even identify them”。每天发生多少次冲突，多少分钟解决，main 上留下了多少坏掉的状态，都没有写。

我想是因为难以测量才没写。确实很难。但是，**别的公司如果要模仿，模仿的就是这里。**Scion 是模仿不了的（文章自己也这么说）。能模仿的是“不要合并队列”这个决定，而只有它是不带数字交出来的。

还有一点，关于因果。文章写道，Scion 的开发始于“与 Claude Mythos Preview 和 Claude Tag 在内部可用差不多同一时期”。如果是这样，9 月的激增究竟是因为 Scion 清除了瓶颈，还是单纯因为模型变强了，**这张图是区分不开的**。文章没有主张是哪一个，所以这是我自己读法上的注意事项。

![拆掉等待合并的队伍前的拦路杆，通过之后一边跑一边修](/images/scion-peak-vs-average/zh/04-the-gate-is-gone.webp)

## 如果只带走一件事

**请检查一次，正文里的数字和图表里的数字有没有对不上。**这次有两处出入，两次都是正文在更大的那一侧。图表并没有藏。峰值还带着写了日期的标注框。即便如此，读正文的人带走的是“每天 3 万个”和“100 倍”。**图是对的，正文也没有说谎，留下来的是更大的那个数字。**

## 出处

- Anthropic Engineering，["Redesigning source control at Anthropic"](https://www.anthropic.com/engineering/redesigning-source-control)，2026 年 10 月 13 日发布（JSON-LD 的 `datePublished` 是 2026-10-13，`dateModified` 是同日 16:27 UTC）。作者是 Nick G. 和 source control team
- 图是同一页上的 6 张图片。带数值的是“Changes merged per day”“Changes to the Scion and Antique codebases per week”“Everyday source control commands on the monorepo”这 3 张

图 1 的数值，是解码 PNG，从柱子顶端的像素位置还原出来的。校准用了**0 的位置**和图表自己在标注框里标出的 **30,401** 两个点。1 个像素大约相当于 29 个变更，所以每个值有 ±30 左右的误差。5 月的平均我实测是 2,237，正文是“around 2,500”。**这在误差范围之内，所以我不会说正文是错的。**9 月的平均 17,913 与 7 日平均线右端 18,004 独立地吻合，我把这作为校准的验证。

图 2、图 3（架构图）不带数值，所以我没有看。

没能确认的东西列在下面。**对 git 镜像 200 倍的占用空间缩减、超过 99% 的缓存命中率、CI 的 CPU 降低 25%、Mythos 重写后“内存降到 1/20、速度 4 倍”，以及 Claude Tag 和 superfan 的运作。**这些都是内部的测量，没有办法从外部验证。这篇文章里写“对得上”的，仅限于**只在文章内部就能闭环的一致性**。

还要说明一点，“more than tenfold”是 meta description 和摘要文字里的说法，不是正文里的。正文只是把“averaged around 2,500”和“merged over 30,000 per day”并排放在一起，并没有明说倍率。把倍率用两种方式算出来的，是我。
