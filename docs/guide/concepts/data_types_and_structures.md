
## 数据类型

`Polars`支持多种数据类型, 大致分为以下几类
- 数值数据类型: 有符号整数(`pl.Int8`, `pl.Int16`, `pl.Int32`, `pl.Int64`), 无符号整数(`pl.UInt8`, `pl.UInt16`, `pl.UInt32`, `pl.UInt64`), 浮点数和小数(`pl.Float32`, `pl.Float64`)
- 嵌套数据类型: 列表(`pl.List`), 结构(`pl.Struct`)和数组(`pl.Array`)   
- 时间: 日期(`pl.Date`)、日期时间(`pl.Datetime`)、时间(`pl.Time`)和时间增量(`pl.Duration`)
- 其他: 字符串(`pl.String`), 二进制数据(`pl.Binary`), 布尔值(`pl.Boolean`), 枚举(`pl.Enum`), 对象(`pl.Object`)

所有类型都支持由特殊值 `null` 表示缺失值, 不能与浮点数数据类型中的特殊值`NaN`混淆。


:::tip
**Polars中也提供两个核心的数据结构: `Series` 和 `DataFrame`**
:::

### Series
序列是一维同构数据结构。“同构”是指序列中的所有元素都具有相同的数据类型。以下代码片段展示了如何创建命名序列：
```python title="Python"
import polars as pl

s = pl.Series("ints", [1, 2, 3, 4, 5])
print(s)
```
```bash
shape: (5,)
Series: 'ints' [i64]
[
	1
	2
	3
	4
	5
]
```
创建Series时，Polars 会根据提供的值自动推断数据类型。当然可以指定具体的数据类型来覆盖推断机制：
```python title="Python"
s1 = pl.Series("ints", [1, 2, 3, 4, 5])
s2 = pl.Series("uints", [1, 2, 3, 4, 5], dtype=pl.UInt64)
print(s1.dtype, s2.dtype)
```
```bash
Int64 UInt64
```


### DataFrame
`DataFrame`是一种二维异构数据结构, 类似Excel表格，包含具有唯一名称的列。下面的代码片段展示了如何从列表字典创建DataFrame：

```python title="Python"
from datetime import date

df = pl.DataFrame(
    {
        "name": ["Alice Archer", "Ben Brown", "Chloe Cooper", "Daniel Donovan"],
        "birthdate": [
            date(1997, 1, 10),
            date(1985, 2, 15),
            date(1983, 3, 22),
            date(1981, 4, 30),
        ],
        "weight": [57.9, 72.5, 53.6, 83.1],  # (kg)
        "height": [1.56, 1.77, 1.65, 1.75],  # (m)
    }
)

print(df)
```
```bash
shape: (4, 4)
┌────────────────┬────────────┬────────┬────────┐
│ name           ┆ birthdate  ┆ weight ┆ height │
│ ---            ┆ ---        ┆ ---    ┆ ---    │
│ str            ┆ date       ┆ f64    ┆ f64    │
╞════════════════╪════════════╪════════╪════════╡
│ Alice Archer   ┆ 1997-01-10 ┆ 57.9   ┆ 1.56   │
│ Ben Brown      ┆ 1985-02-15 ┆ 72.5   ┆ 1.77   │
│ Chloe Cooper   ┆ 1983-03-22 ┆ 53.6   ┆ 1.65   │
│ Daniel Donovan ┆ 1981-04-30 ┆ 83.1   ┆ 1.75   │
└────────────────┴────────────┴────────┴────────┘
```

#### 方法
展示一些 DataFrame 的实用方法。

##### head
函数head显示数据框的前几行。默认情况下，获取前 5 行，也可以指定所需的行数:
```python title="Python"
print(df.head(3))
```

##### glimpse
函数glimpse是另一个显示数据框前几行值的函数，但输出格式与 不同head。这里，输出的每一行对应一列，这使得检查更宽的DataFrame变得更加容易:
```python title="Python"
print(df.glimpse(return_as_string=True))
```
```bash
Rows: 4
Columns: 4
$ name       <str> 'Alice Archer', 'Ben Brown', 'Chloe Cooper', 'Daniel Donovan'
$ birthdate <date> 1997-01-10, 1985-02-15, 1983-03-22, 1981-04-30
$ weight     <f64> 57.9, 72.5, 53.6, 83.1
$ height     <f64> 1.56, 1.77, 1.65, 1.75
```
::: info
`glimpse` 仅适用于 Python 用户。
:::


##### tail
函数tail显示 DataFrame 的最后几行。默认情况下，将获取最后 5 行，但也可以指定所需的行数，类似于以下head工作原理：
```python title="Python"
print(df.tail(3))
```

##### sample
如果认为 DataFrame 的第一行或最后一行不能代表数据，可以使用sample从 DataFrame 中随机获取任意数量的行。请注意，返回的行不一定与它们在 DataFrame 中出现的顺序相同：
```python title="Python"
print(df.sample(2))
```

##### describe
可以使用describe来计算DataFrame所有列的汇总统计数据，类似pandas的describe:
```python title="Python"
print(df.describe())
```
```bash
shape: (9, 5)
┌────────────┬────────────────┬─────────────────────┬───────────┬──────────┐
│ statistic  ┆ name           ┆ birthdate           ┆ weight    ┆ height   │
│ ---        ┆ ---            ┆ ---                 ┆ ---       ┆ ---      │
│ str        ┆ str            ┆ str                 ┆ f64       ┆ f64      │
╞════════════╪════════════════╪═════════════════════╪═══════════╪══════════╡
│ count      ┆ 4              ┆ 4                   ┆ 4.0       ┆ 4.0      │
│ null_count ┆ 0              ┆ 0                   ┆ 0.0       ┆ 0.0      │
│ mean       ┆ null           ┆ 1986-09-04 00:00:00 ┆ 66.775    ┆ 1.6825   │
│ std        ┆ null           ┆ null                ┆ 13.560082 ┆ 0.097082 │
│ min        ┆ Alice Archer   ┆ 1981-04-30          ┆ 53.6      ┆ 1.56     │
│ 25%        ┆ null           ┆ 1983-03-22          ┆ 57.9      ┆ 1.65     │
│ 50%        ┆ null           ┆ 1985-02-15          ┆ 72.5      ┆ 1.75     │
│ 75%        ┆ null           ┆ 1985-02-15          ┆ 72.5      ┆ 1.75     │
│ max        ┆ Daniel Donovan ┆ 1997-01-10          ┆ 83.1      ┆ 1.77     │
└────────────┴────────────────┴─────────────────────┴───────────┴──────────┘
```



##### schema
取表格架构，返回类似于字典的mapping类型：
```python title="Python"
print(df.schema)
```
```bash
Schema([('name', String), ('birthdate', Date), ('weight', Float64), ('height', Float64)])
```
与Series非常相似，Polars 会在创建DataFrame时自动推断其类型，也可以根据需要指定类型。如果您不想手动指定，可以使用None表示跳过：
```python title="Python"
df = pl.DataFrame(
    {
        "name": ["Alice", "Ben", "Chloe", "Daniel"],
        "age": [27, 39, 41, 43],
    },
    schema={"name": None, "age": pl.UInt8},
)

print(df)
```
```bash
shape: (4, 2)
┌────────┬─────┐
│ name   ┆ age │
│ ---    ┆ --- │
│ str    ┆ u8  │
╞════════╪═════╡
│ Alice  ┆ 27  │
│ Ben    ┆ 39  │
│ Chloe  ┆ 41  │
│ Daniel ┆ 43  │
└────────┴─────┘
```
如果只想需要覆盖某些列的推断，则参数schema_overrides往往更方便：
```python title="Python"
df = pl.DataFrame(
    {
        "name": ["Alice", "Ben", "Chloe", "Daniel"],
        "age": [27, 39, 41, 43],
    },
    schema_overrides={"age": pl.UInt8},
)

print(df)
```
```bash
shape: (4, 2)
┌────────┬─────┐
│ name   ┆ age │
│ ---    ┆ --- │
│ str    ┆ u8  │
╞════════╪═════╡
│ Alice  ┆ 27  │
│ Ben    ┆ 39  │
│ Chloe  ┆ 41  │
│ Daniel ┆ 43  │
└────────┴─────┘
```

