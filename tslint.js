/* global module */

// обеспечить надежность статического анализа
// учесть особенности IDEA
// учесть сложившиеся традиции оформления кода
// по возможности унифицировать кодстайл с java
// не заставлять разработчиков заниматься удовлетворением линтинга ради красоты кода

// Стратегия: взять самый строгий набор правил и отключить наиболее неудобное

module.exports = {
    "extends": "tslint:all",
    "linterOptions": {

    },
    "rules": {
        "binary-expression-operand-order": false,
        "increment-decrement": false,
        "strict-boolean-expressions": false,
        "max-line-length": false,
        "member-access": false,
        "no-promise-as-boolean": false,
        "arrow-parens": false,
        "no-void-expression": [true, "ignore-arrow-function-shorthand"],
        "promise-function-async": false,
        "no-console": false,
        "prefer-template": [true, "allow-single-concat"],
        "restrict-plus-operands": true,
        "type-literal-delimiter": true,
        "interface-over-type-literal": true,
        "prefer-conditional-expression": false,
        "cyclomatic-complexity": false,
        "prefer-readonly": false,
        "no-floating-promises": false,
        "no-default-import": false,
        "no-default-export": false,
        "match-default-export-name": false,
        "no-unnecessary-type-assertion": false,
        // max-classes-per-file: A maximum of 1 class per file is allowed.
        "max-classes-per-file": false,
        // object-literal-key-quotes: Unnecessarily quoted property '12' found.
        "object-literal-key-quotes": false,
        // no-unused-expression: unused expression, expected an assignment or function call
        "no-unused-expression": [true, "allow-fast-null-checks"],
        "no-object-literal-type-assertion": false,
        "prefer-for-of": false,
        "return-undefined": false,
        // unnecessary-else: The preceding `if` block ends with a `return` statement. This `else` is unnecessary.
        "unnecessary-else": false,
        // prefer-const: Identifier 'res' is never reassigned; use 'const' instead of 'let'.
        "prefer-const": false,
        // array-type: Array type using 'T[]' is forbidden for non-simple types. Use 'Array<T>' instead.
        "array-type": false,
        "no-for-in": false,
        "object-literal-shorthand": false,
        "strict-comparisons": false,
        "invalid-void": false,
        "no-null-undefined-union": false,


        // Не будем выравнивать параметры в setTimeout и Object.assign
        "align": [
            true,
            "parameters",
            "statements"
        ],
        // Неясно, есть ли выгода от arrow для tsx
        "arrow-return-shorthand": false,
        // Мешает комментировать фрагменты кода
        "comment-format": [
            true,
            "check-space"
        ],
        // Никто не пишет jsdoc, никто не исправляет его после расхождения контрактов. В Java тоже не пишут
        "completed-docs": false,
        // Косметика
        "eofline": false,
        // Могут быть использованы сторонние библиотеки, не попадающие под конвенцию
        "file-name-casing": false,
        // Неясно, с какой целью нужно группировать импорты. Неясно, можно ли научить IDEA группировать по этому правилу
        "grouped-imports": false,
        // Порядок описания полей может иметь семантику, определяемую разработчиком
        "member-ordering": false,
        // Иначе мы умучаемся писать типы для локальных переменных
        "no-inferrable-types": true,
        // null и undefined — разные вещи
        "no-null-keyword": false,
        // вкусовщина
        "newline-before-return": false,
        // Неясно, зачем решать стиль чейнинга за разработчика
        "newline-per-chained-call": false,
        // Не тянуть в зависимости проекта общие библиотеки, например React
        "no-implicit-dependencies": false,
        // Мешает использовать !postfix, заставляя описывать дополнительные проверки
        "no-non-null-assertion": false,
        // Неясно, какие профиты имеем от запрета
        "no-parameter-reassignment": false,
        // Будем описывать всё в терминах ts пр миграции сразу. Расширение файла всё равно меняется
        "no-redundant-jsdoc": true,
        // Нет смысла ужесточать правило доступа к полям объекта, т.к. наличие проверяется noImplicitAny
        "no-string-literal": false,
        // Разрешаем импортировать основные модули, иначе IDEA подсвечивает желтым
        "no-submodule-imports": false,
        // Не запрещать классы со статичными методами
        "no-unnecessary-class": ["allow-constructor-only", "allow-static-only"],
        // Неясно, зачем навязывать сортировку полей
        "object-literal-sort-keys": false,
        // Неясно, с какой целью нужно группировать импорты. Неясно, можно ли научить IDEA группировать по этому правилу
        "ordered-imports": false,
        // неясно, зачем заставлять разработчика переделывать методы на функции. Сегодня this есть, а завтра нет
        "prefer-function-over-method": false,
        // Неясно, зачем в интерфейсах и типах описывать сигнатуру как-то по-другому
        "prefer-method-signature": false,
        // Будем считать, что кавычки — дело вкуса
        "quotemark": false,
        // неясно, зачем в интерфейсах использовать ; В Java enum используют ,
        "semicolon": [
            true,
            "always",
            "ignore-interfaces",
            "strict-bound-class-methods"
        ],
        // Неясно, зачем требовать ставить ,
        "trailing-comma": false,
        // Будем считать, что максимальный режим строгости нас спасет
        "typedef": false,
        // Экспорт компонента в tsx должет совпадать с именем файла, поэтому разрешаем PascalCase
        // Отменяем check-format из-за __html в dangerouslySetInnerHTML
        "variable-name": [
            true,
            "ban-keywords",
            "allow-pascal-case"
        ],
        // IDEA не ставит пробелы в автоимпортах
        "whitespace": [
            true,
            "check-branch",
            "check-decl",
            "check-operator",
            "check-separator",
            "check-type",
            "check-typecast",
            "check-preblock"
        ],
        "no-any": false,
        "no-magic-numbers": false,
        "only-arrow-functions": false,
        "ban-ts-ignore": false,
        "no-import-side-effect": false
    }
};
