// リストで表示データを準備しとく
var subjectGroupData = _.map(
    _.filter(_.uniqBy(accountData, 'subjectGroupCd'), function(data) { return data.typeCode !== 'assets' }),
    function(data) {
        return _.pick(data, ['subjectGroupCd', 'subjectGroupName']);
    }
);
var subjectData = _.map(
    _.filter(_.uniqBy(accountData, 'subjectCd'), function(data) { return data.typeCode !== 'assets' }),
    function(data) {
        return _.pick(data, ['subjectCd', 'subjectName', 'subjectGroupCd']);
    }
);
var opponentSubjectData = _.map(
    _.filter(_.uniqBy(accountData, 'subjectDetailCd'), ['typeCode', 'assets']),
    function(data) {
        return _.pick(data, ['subjectDetailCd', 'subjectDetailName']);
    }
);
var subjectDetailData = _.map(
    _.filter(_.uniqBy(accountData, 'subjectDetailCd'), function(data) { return data.typeCode !== 'assets' }),
    function(data) {
        return _.pick(data, ['subjectDetailCd', 'subjectDetailName', 'subjectCd']);
    }
);

// メインアップロジック
var app = new Vue({
    el: '#app',
    data: {
        // 検索部分のデータ
        theaterCd: query.theaterCd || '',
        date: {
            date: 0,
            month: query.month || 0,
            year: query.year || 0
        },
        // メインデータ
        incomes: incomeData,
        // リスト表示ためのデータ
        accounts: accountData,
        subjects: subjectData,
        opponentSubjects: opponentSubjectData,
        subjectGroups: subjectGroupData,
        subjectDetails: subjectDetailData,
        screeningWorks: [],
        loading: {
            isLoading: false,
            message: ''
        },
        // JSが初期化官僚かどうか
        initialized: false
    },
    methods:{
        // 「日」リストを作る
        calculateDate: function(year, month) {
            if (year === 0 || month === 0) {
                return [];
            }
            var date = new Date(year, month - 1, 1);
            var dateArr = ['01'];
            for (var i = 2; i <= 31; i++) {
                date.setDate(i);
                if (date.getMonth() === month - 1) {
                    dateArr.push(this.padZero(i));
                }
            }
            if (dateArr.indexOf(this.date.date) < 0) {
                this.date.date = '01';
            }
            return dateArr;
        },
        // 検索のバリデーション
        search: function(e) {
            e.preventDefault();
            if (
                this.theaterCd  === ''
             || this.date.date  === 0
             || this.date.month === 0
             || this.date.year  === 0
            ) {
                alert('条件が足りません！');
            } else {
                this.loading = {
                    isLoading: true,
                    message: '読み込み中。。。'
                };
                document.getElementById('search-form').submit();
            }
        },
        // 日、月の前、０を追加する (2 => 02, 12 => 12)
        padZero: function(number) {
            return `0${number}`.slice(-2);
        },
        // 新行を追加する
        addRow: function() {
            var theater = document.getElementsByName('theaterCd')[0];
            var theaterName = theater.options[theater.selectedIndex].text;
            var data = {
                date: `${this.date.year}-${this.date.month}-${this.date.date}`,
                subjectCd: null,
                subjectName: '',
                subjectGroupCd: null,
                subjectGroupName: '',
                subjectDetailCd: null,
                subjectDetailName: '',
                opponentSubjectCd: '',
                opponentSubjectName: '',
                screeningWorkId: '',
                screeningWorkName: '',
                screeningWorkSubTitle: '',
                workCd: '',
                note: '',
                amount: '',
                quantity: '',
                theaterCd: this.theaterCd,
                theaterName: theaterName,
                isValid: true,
                id: this.id()
            };
            // 全ての日付と劇場は一緒になるため
            if (this.incomes.length > 0) {
                data.date = this.incomes[0].date;
                data.theaterCd = this.incomes[0].theaterCd;
                data.theaterName = this.incomes[0].theaterName;
            }
            this.incomes.push(data);
        },
        // データ削除
        deleteRow: function(row) {
            if (
                this.incomes[row].subjectDetailCd === null ||
                confirm('細目コード' + this.incomes[row].subjectDetailCd + 'の行を削除します。よろしいですか。')
            ) {
                this.incomes.splice(row, 1);
            }
        },
        // 上映作品データ更新
        updateScreeningWorkData: function(data) {
            this.screeningWorks = data;
        },
        // AJAXで上映作品データ取得
        updateScreeningWork: function() {
            var data = { 
                date: `${this.date.year}-${this.date.month}-${this.date.date}`,
                theaterCd: this.theaterCd
            };
            this.loading = {
                isLoading: true,
                message: '読み込み中。。。'
            };
            $.getJSON(
                '/api/getScreeningWork',
                data,
                this.updateScreeningWorkData
            ).error(function() {
                alert(`
                    劇場コード：${data.theaterCd}
                    日付：${data.date}
                    で上映作品データを取得できません。
                    再度試してください。
                `);
            }).always(this.hideLoading);
        },
        // 科目分類を変更時、科目リストを再度作る必要がある
        generateSubjects: function(subjectGroupCd) {
            return _.filter(subjectData, function(subject) {
                return subject.subjectGroupCd === subjectGroupCd;
            });
        },
        // 科目を変更時、細目リストを再度作る必要がある
        generateSubjectDetails: function(subjectCd) {
            return _.filter(subjectDetailData, function(subjectDetail) {
                return subjectDetail.subjectCd === subjectCd;
            });
        },
        // 選択した項目をリセット
        resetSubject: function(subject, subjectDetail, index) {
            if (subject) {
                this.incomes[index].subjectCd = null;
            }
            if (subjectDetail) {
                this.incomes[index].subjectDetailCd = null;
            }
        },
        // 細目コードを入力した後、相応のデータを自動選択する
        searchSubjectDetailByCode: function(subjectDetailCd, index) {
            var found = _.find(accountData, function(data) {
                return data.subjectDetailCd === subjectDetailCd.trim();
            });
            if (found !== undefined) {
                this.incomes[index].subjectGroupCd = found.subjectGroupCd;
                this.incomes[index].subjectCd = found.subjectCd;
                this.incomes[index].subjectDetailCd = subjectDetailCd.trim();
            } else {
                this.incomes[index].subjectGroupCd = null;
                this.incomes[index].subjectCd = null;
                this.incomes[index].subjectDetailCd = null;
                alert('入力した細目コードがありません。\n再度確認してください。');
            }
        },
        // ユニックIDを作る
        id: function() {
            // Math.random should be unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return Math.random().toString(36).substr(2, 9);
        },
        // データバリデーション
        submit: function() {
            var isValid = true;
            var message = '';
            var movies = this.screeningWorks;
            var postData = [];
            _(this.incomes).each(function(income) {
                if (
                    // 選択していない項目があるかチェックする
                    income.subjectCd       === null
                 || income.subjectGroupCd  === null
                 || income.subjectDetailCd === null
                ) {
                    isValid = false;
                    message = '細目コードが空白の行が存在してます。';
                    income.isValid = false;
                }
                if (
                    // 金額が入力（１以上）の場合、相手科目は必須とする
                    income.amount            >   0
                 && income.opponentSubjectCd === ''
                ) {
                    isValid = false;
                    message = '相手細目が未選択です。';
                    income.isValid = false;
                }
                if (isValid) {
                    // 検索時、undefinedと返却場合があるから、エラーをハンドルする
                    try {
                        var data = JSON.parse(JSON.stringify(income)); // ダータをクロンする
                        data.subjectName = _(subjectData)
                        .find(['subjectCd', data.subjectCd]).subjectName;
                        data.subjectGroupName = _(subjectGroupData)
                            .find(['subjectGroupCd', data.subjectGroupCd]).subjectGroupName;
                        data.subjectDetailName = _(subjectDetailData)
                            .find(['subjectDetailCd', data.subjectDetailCd]).subjectDetailName;
                        if (data.opponentSubjectCd !== '') {
                            data.opponentSubjectName = _(opponentSubjectData)
                                .find(['subjectDetailCd', data.opponentSubjectCd]).subjectDetailName;
                        } else {
                            data.opponentSubjectCd = null;
                            data.opponentSubjectName = null;
                        }
                        if (data.screeningWorkId !== '') {
                            var movie = _(movies).find(['screeningWorkId', data.screeningWorkId]);
                            data.screeningWorkName = movie.screeningWorkName;
                            data.screeningWorkSubTitle = movie.screeningWorkSubTitle;
                            data.workCd = movie.workCd;
                        } else {
                            data.screeningWorkId = null;
                            data.screeningWorkName = null;
                            data.screeningWorkSubTitle = null;
                            data.workCd = null;
                        }
                        income.isValid = true;
                        postData.push(data);
                    } catch (err) {
                        console.error(err);
                        isValid = false;
                        income.isValid = false;
                    }
                }
            });
            var isToday = new Date().toISOString().indexOf(this.incomes[0].date.slice(0, 10)) >= 0;
            if (isValid && (isToday || confirm('本日以外の内容を変更します。よろしいですか？'))) {
                // OK => AJAXでデータをサーバに流す
                // console.log(this.incomes);
                this.loading = {
                    isLoading: true,
                    message: '保存中。。。'
                };
                $.ajax('/api/saveIncomes', {
                    method: 'POST',
                    data: { data: postData },
                    success: function () {
                        // 保存中というメッセージを非表示になった後、ダイアログを表示
                        setTimeout(function() {
                            alert('正常に保存されました。');
                        }, 100);
                    },
                    error: function(err) {
                        console.error(err);
                        alert('エラーが発生しました。');
                    },
                    complete: this.hideLoading
                });
            } else if (!isValid) {
                alert(message);
            }
        },
        hideLoading: function() {
            this.loading = { isLoading: false };
        },
        parseNumberInput: function(event) {
            var value = parseInt(event.target.value);
            var identifier = event.target.name.split('-');
            var index = identifier[1];
            var property = identifier[0];
            if (value > 0) {
                this.incomes[index][property] = value;
            } else {
                this.incomes[index][property] = '';
            }
        }
    },
    computed: {
        dateChanged: function() {
            return this.theaterCd  !== query.theaterCd
                || this.date.date  !== query.date
                || this.date.month !== query.month
                || this.date.year  !== query.year;
        }
    },
    created: function() {
        // リストを初期化後で値をセットする
        this.date.date = query.date;
        if (
            this.date.date  === 0 ||
            this.date.month === 0 ||
            this.date.year  === 0
        ) {
            var d = new Date();
            this.date = {
                date: this.padZero(d.getDate()),
                month: this.padZero(d.getMonth() + 1),
                year: d.getFullYear()
            }
        }
        // 上映作品リストを取得
        this.updateScreeningWork();
        // データにステートを追加する
        _(this.incomes).each(function(i) { i.isValid = true });
        this.initialized = true;
    }
});
