const subName = (value) => {
    if (value) {
        return value.substr(value.length - 2)
    }
}
const globalData = getApp().globalData

function showWxToast(msg, complete) {
    if (!msg) {
        return
    }
    wx.showToast({
        title: msg,
        icon: 'none',
        duration: 3000,
        complete: complete
    })
}

function showWxNetErrorToast(msg) {
    let message = msg
    if (msg === 'undefined' || isNullString(msg)) {
        return
    }
    wx.showToast({
        title: message,
        icon: 'none',
        duration: 3000
    })
}

// 将对象转换为Url参数
function convertObjectToUrlParams(item) {
    let tempUrl = ''
    for (let key in item) {
        tempUrl += key + '=' + item[key] + '&'
    }
    return tempUrl
}

function distinctWifiList(wifiList) {
    let result = {}
    let finalResult = []
    for (let i = 0; i < wifiList.length; i++) {
        if (wifiList[i].SSID !== null && wifiList[i].SSID !== '') {
            result[wifiList[i].SSID] = wifiList[i]
        }
    }
    for (let key in result) {
        finalResult.push(result[key])
    }
    return finalResult
}
function handleWifiErrorCode(errorCode) {
    let errorTip
    switch (errorCode) {
        case 12001:
            errorTip = '当前系统不支持相关能力'
            break
        case 12005:
            errorTip = '未打开 Wi-Fi 开关'
            break
        case 12006:
            errorTip = '未打开 GPS 定位开关'
            break
        case 12002:
            errorTip = 'Wi-Fi 密码错误'
            break
        case 12003:
            errorTip = '连接超时'
            break
        case 12004:
            errorTip = '重复连接 Wi-Fi'
            break
        case 12007:
            errorTip = '用户拒绝授权链接 Wi-Fi'
            break
        case 12008:
            errorTip = '无效SSID'
            break
        case 12009:
            errorTip = '系统运营商配置拒绝连接 Wi-Fi'
            break
        case 12010:
            errorTip = '系统其他错误'
            break
        case 12011:
            errorTip = '应用在后台无法配置 Wi-Fi'
            break
        case 12000:
            errorTip = '未先调用startWifi接口'
            break
    }
    if (errorTip) {
        wx.showToast({
            title: errorTip,
            icon: 'none',
            duration: 3000
        })
    }
    return errorTip
}

function sortWifiList(wifiList) {
    var compare = function(obj1, obj2) {
        var val1 = obj1.signalStrength
        var val2 = obj2.signalStrength
        if (val1 < val2) {
            return 1
        } else if (val1 > val2) {
            return -1
        } else {
            return 0
        }
    }
    return wifiList.sort(compare)
}

function parseUrl(url) {
    var obj = {}
    var queryArr = url.split('&')
    queryArr.forEach(function(item) {
        var key = item.split('=')[0]
        var value = item.split('=')[1]
        obj[key] = value
    })
    return obj
}

function parseHttpUrl(url) {
    var obj = {}
    var list = url.split('?')
    if (list) {
        var query = list[1]
        if (query) {
            var queryArr = query.split('&')
            queryArr.forEach(function(item) {
                var key = item.split('=')[0]
                var value = item.split('=')[1]
                obj[key] = value
            })
        }
    }

    return obj
}

function isNullString(str) {
    if (str) {
        if (str.length === 0) { return true }
    } else { return true }
    return false
}

function isValueString(str) {
    if (str) {
        if (typeof (str.valueOf()) === 'string' && str.length > 0) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

// 检查 wx api 是否可用
function checkWechatApi(apiName) {
    if (apiName) {
        return true
    } else {
        showWxToast('当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。')
        return false
    }
}

// 调试模式
function debugMode() {
    const globalData = getApp().globalData
    if (globalData.config.env === 'pd') {
        return false
    } else {
        return true
    }
}

function getPagePosition(searchPage) {
    let pages = getCurrentPages() // eslint-disable-line
    let index
    let isFind = false
    let position = pages.length - 1
    for (index in pages) {
        if (pages[index].route === searchPage) {
            position = position - index
            isFind = true
            break
        }
    }
    if (!isFind) position = -1
    return position
}

function shouldFindPagePosition(searchPage) {
    let pages = getCurrentPages() // eslint-disable-line
    let index
    let position = -1
    for (index in pages) {
        if (pages[index].route === searchPage) {
            position = pages.length - 1 - index
            break
        }
    }
    return position
}

function checkAuthorize(authorizeStr, callback) {
    wx.getSetting({
        success(res) {
            if (!res.authSetting[authorizeStr]) {
                wx.authorize({
                    scope: authorizeStr,
                    success() {
                        // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                        callback(true)
                    },
                    fail() {
                        isNeedOpenSetting(authorizeStr, callback)
                    }
                })
            } else {
                callback(true)
            }
        }
    })
}

function isNeedOpenSetting(authorizeStr, callback) {
    wx.showModal({
        title: '授权请求',
        content: '该功能需要' + getAuthorizeChinese(authorizeStr) + '授权',
        confirmText: '去授权',
        success: function(res) {
            if (res.confirm) {
                wx.openSetting({
                    success: (res) => {
                        let authArray = res.authSetting
                        for (let key in authArray) {
                            if (key === authorizeStr) {
                                callback(authArray[key])
                                break
                            }
                        }
                    }
                })
            } else if (res.cancel) {
                callback(false)
            }
        }
    })
}

function getAuthorizeChinese(authorizeStr) {
    switch (authorizeStr) {
        case 'scope.userInfo':
            return '用户信息'
        case 'scope.userLocation':
            return '地理位置'
        case 'scope.address':
            return '通讯地址'
        case 'scope.werun':
            return '微信运动步数'
        case 'scope.invoiceTitle':
            return '发票抬头'
        case 'scope.record':
            return '录音功能'
        case 'scope.writePhotosAlbum':
            return '保存到相册'
        case 'scope.camera':
            return '摄像头'
        default:
            return ''
    }
}

function getShareAppMessage(path, titleName) {
    let nickName = typeof (globalData.userInfo.nickName) !== 'undefined' ? globalData.userInfo.nickName : ''
    return {
        title: nickName + titleName,
        path: path,
        imageUrl: 'https://cdn.2haohr.com/ios/img/wifi/share_imgn.png'
    }
}

function getGoPreviewWifiData(data) {
    let tempData = {}
    tempData.slogan = data.slogan
    tempData.qrCodePicUrl = data.qrcode_url
    tempData.wifiName = data.name
    tempData.remark = data.remark
    tempData.scene = data.scene_code
    tempData.bgUrl = globalData.imgBgUrls[data.template - 1]
    tempData.password = data.password
    tempData.imgUrl = globalData.imgUrls[data.template - 1]
    tempData.id = data.id
    tempData.wifi_ssid = data.wifi_ssid
    tempData.wifi_bssid = data.wifi_bssid
    tempData.index = data.template - 1
    tempData.is_repeat_sign = data.is_repeat_sign
    tempData.welcome_type = data.welcome_type
    return tempData
}

function encodeUrl(data) {
    let returnStr = 'params=' + encodeURIComponent(JSON.stringify(data))
    return returnStr
}

function decodeUrl(data) {
    let decodeStr = JSON.parse(decodeURIComponent(data.params))
    return decodeStr
}

function getWXErrorMsg(errorMsg) {
    // getLocation:fail
    // getLocation:fail 1

    if (errorMsg.search('fail no wifi is connected') !== -1) {
        return '当前没有连接wifi'
    } else if (errorMsg.search('getLocation:fail:auth canceled') !== -1) {
        return '定位没有授权'
    } else if (errorMsg.search('getLocation:fail:auth denied') !== -1) {
        return '定位没有授权'
    } else if (errorMsg.search('getLocation:fail time out') !== -1) {
        return '定位超时'
    } else if (errorMsg.search('may be not open GPS') !== -1) {
        return '可能没有打开GPS'
    } else if (errorMsg.search('wifi is disable') !== -1) {
        return 'wifi不可用'
    }
}

function compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    var len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }

    for (var i = 0; i < len; i++) {
        var num1 = parseInt(v1[i])
        var num2 = parseInt(v2[i])

        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }

    return 0
}

function lowVersionPrompt(apiVersion) {
    var res = wx.getSystemInfoSync()
    let com = compareVersion(res.SDKVersion, apiVersion)// 客户端基础库版本
    if (com < 0) {
        showWxToast('当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。')
    } else {
        com = wxCompareLowVersion(res.version)// 微信版本号
        if (com >= 0) {
            let versionArray = res.system.split(' ')
            let versionNum = versionArray[versionArray.length - 1]
            if (res.platform === 'ios') {
                com = compareVersion(versionNum, '9.0.0')
            } else {
                com = compareVersion(versionNum, '5.0.0')
            }
            if (com < 0) {
                showWxToast('当前系统版本过低，无法使用该功能，请升级到最新系统版本后重试。')
            }
        }
    }
}

function wxCompareLowVersion(version) {
    let com = compareVersion(version, '6.6.0')
    if (com < 0) {
        showWxToast('当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。')
    }
    return com
}

function handleErrorToast(error) {
    let errorTip = handleWifiErrorCode(error.errCode)
    if (!errorTip) {
        lowVersionPrompt('1.6.0')
    }
}

export {
    subName,
    convertObjectToUrlParams,
    showWxToast,
    showWxNetErrorToast,
    distinctWifiList,
    sortWifiList,
    handleWifiErrorCode,
    isNullString,
    parseUrl,
    parseHttpUrl,
    checkWechatApi,
    debugMode,
    getPagePosition,
    getGoPreviewWifiData,
    shouldFindPagePosition,
    checkAuthorize,
    getShareAppMessage,
    handleErrorToast,
    getWXErrorMsg,
    isValueString,
    encodeUrl,
    decodeUrl
}
