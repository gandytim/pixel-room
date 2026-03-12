import { items } from "./assets/data.js"

// DOM Elements
const lightModeDiv = document.querySelector('.light-switch')
const tabs = document.querySelectorAll('.tab')
const startButton = document.querySelector('.start_game')
const appWrapper = document.querySelector('.app_wrapper')
const clickerButton = document.querySelector('.clicker')
const coinsCounter = document.querySelector('.coins-counter')
const coinsDisplay = document.querySelector('.coins')



// Variables d'état
let currentLightMode = 'dark'
let currentTab = document.querySelector('.thumbnail.active')
let selectedItems = {
    floors: '../assets/floors/floor_wood_brown.png',
    walls: '../assets/walls/walls_white.png',
    decorations: {
        carpet: '',
        desk: '',
        window: '',
    },
}
let coins = 0


// Event Listeners
lightModeDiv.addEventListener('click', switchLightMode)

tabs.forEach(tab => {
    tab.querySelector('.thumbnail').addEventListener('click', switchTab)
})

startButton.addEventListener('click', startGame)

clickerButton.addEventListener('click', clicker)

coinsDisplay.addEventListener('mouseenter', e => {
    if (coins < 10000) return
    const coinsDetail = document.createElement('p')
    coinsDetail.classList.add('coins-detail')
    coinsDetail.innerText = coins
    coinsDisplay.appendChild(coinsDetail)
})
coinsDisplay.addEventListener('mouseleave', () => {
    const coinsDetail = document.querySelector('.coins-detail')
    coinsDetail?.remove()
})



// Functions
function startGame () {
    startButton.style.display = 'none'
    appWrapper.style.display = 'flex'
    passiveCoinsGeneration()
}

function switchLightMode () {
    let icon = document.querySelector('.light-icon')
    if (icon) {
        icon.remove()
        currentLightMode = currentLightMode === 'light' ? 'dark' : 'light'
    }
    icon = document.createElement('img')
    icon.setAttribute('src', `./assets/interface/${currentLightMode === 'light' ? 'dark_mode' : 'light_mode'}.png`)
    icon.classList.add('icon', 'light-icon')
    lightModeDiv.appendChild(icon)

    document.querySelector('body').classList.remove('light-mode', 'dark-mode')
    document.querySelector('body').classList.add(currentLightMode === 'light' ? 'light-mode' : 'dark-mode')
}

function switchTab (e) {
    currentTab?.classList.remove('active')

    if (e.currentTarget !== currentTab) {
        currentTab = e.currentTarget
        currentTab.classList.add('active')
        openTab()
    } else {
        currentTab = undefined
        document.querySelector('.drawer')?.remove()
    }
    
}

function openTab () {
    if (!currentTab) return 

    document.querySelector('.drawer')?.remove()

    const section = currentTab.parentElement.id
    const itemDrawer = document.createElement('div')
    itemDrawer.classList.add('drawer')
    currentTab.parentElement.appendChild(itemDrawer)

    let itemList = []

    items[section].forEach(item => {
        const itemWrapper = document.createElement('div')
        itemWrapper.classList.add('item-wrapper')

        const itemIcon = document.createElement('img')
        itemIcon.setAttribute('src', item.url)

        const itemLocked = document.createElement('div')
        itemLocked.classList.add('locked', 'hidden')

        itemWrapper.append(itemIcon, itemLocked)
        itemDrawer.appendChild(itemWrapper)

        itemList.push(itemWrapper)
    })

    showSelectedItems()
    showLockedItems(section, itemList)
    selectItem()
    
}

/*
 * Permet d'ajouter une classe 'active' sur les items selectionnés lorsque l'on ouvre le tirroir contenant les différents items 
 */
function showSelectedItems () {
    const itemDrawer = document.querySelector('.drawer')
    const items = itemDrawer?.querySelectorAll('.item-wrapper')
    const section = itemDrawer?.parentElement.id


    items.forEach(item => {
        item.classList.remove('active')
        const itemURL = item.querySelector('img').getAttribute('src')
        if (section === 'decorations') {

            const srcClean = itemURL.split('decorations/')[1]
            const decorationType = srcClean.startsWith('carpet') ? 'carpet' : srcClean.startsWith('desk') ? 'desk' : 'window'

            if (itemURL === selectedItems[section][decorationType]) {
                item.classList.add('active')
            } 
        } else {
            if (itemURL === selectedItems[section]) {
                item.classList.add('active')
            } 
        }
        
    })
}

function showLockedItems (section, itemList) {

    items[section].forEach(item => {
        itemList.forEach(i => {
            const itemImg = i.querySelector('img')
            const lockedDiv = i.querySelector('.locked')

            if (itemImg.getAttribute('src') === item.url) {
                if (item.locked) {
                    lockedDiv.classList.remove('hidden')

                    const priceDiv = document.createElement('div')
                    priceDiv.classList.add('price')
                    const coinsLogo = document.createElement('img')
                    coinsLogo.setAttribute('src', './assets/interface/coins.png')
                    const price = document.createElement('p')
                    price.innerText = item.price

                    priceDiv.append(coinsLogo, price)
                    lockedDiv.appendChild(priceDiv)
                } 
                
            } 
        })
    })
}
 
function selectItem () {

    const itemDrawer = document.querySelector('.drawer')
    const itemsInDrawer = itemDrawer?.querySelectorAll('.item-wrapper')
    const section = itemDrawer?.parentElement.id

    const switchItem = e => {
        const scene = document.querySelector('.scene')
        let currentItem = scene.querySelector(`#current_${section}`)
        const clickedItemSrc = e.currentTarget.querySelector('img').getAttribute('src') // idée: si miniature diff de élément en grand : on peut modifier l'url en enlevant un _thumbnail par exemple

        if (!verifyItemAvailable(clickedItemSrc, section)) {
            return showAlert('You need to buy this item first!')
        }

        if (!currentItem && section !== 'decorations') {
            currentItem = document.createElement('img')
            currentItem.id = `current_${section}`
            scene.appendChild(currentItem)
        }
        
        
        if (section === 'decorations') {

            const srcSplit = clickedItemSrc.split('decorations/')[1]
            const decorationType = srcSplit.startsWith('carpet') ? 'carpet' : srcSplit.startsWith('desk') ? 'desk' : 'window'

            currentItem = scene.querySelector(`#current_${section}-${decorationType}`)

            if (!currentItem) {
                currentItem = document.createElement('img')
                currentItem.id = `current_${section}-${decorationType}`
                scene.appendChild(currentItem)
            }

            if (selectedItems[section][decorationType] === clickedItemSrc) {
                selectedItems[section][decorationType] = ''
                currentItem.remove()
            } else {
                selectedItems[section][decorationType] = clickedItemSrc
            }

        } else {
            selectedItems[section] = clickedItemSrc
        }
        
        
        currentItem?.setAttribute('src', clickedItemSrc)
        
        showSelectedItems()


    }

    itemsInDrawer.forEach(item => {
        item.addEventListener('click', switchItem)
    })


}

function fullScreenActions () {
    const reduce = document.querySelector('.reduce')
    const fullscreen = document.querySelector('.fullscreen')
    const cross = document.querySelector('.cross')

    reduce.addEventListener('click', e => {
        const appMain = document.querySelector('.app_main')

        appMain.classList.contains('hidden') ? appMain.classList.remove('hidden') : appMain.classList.add('hidden')
    })

    fullscreen.addEventListener('click', e => {
        const containerWidth = appWrapper.getBoundingClientRect().width

        if (containerWidth === window.innerWidth) {
            appWrapper.style.height = '90vh'
            appWrapper.style.width = '80vw'
            appWrapper.style.maxWidth = '1200px'
        } else {
            appWrapper.style.maxWidth = 'none'
            appWrapper.style.height = '100vh'
            appWrapper.style.width = '100vw'
        }
    })

    cross.addEventListener('click', e => {
        startButton.style.display = 'flex'
        appWrapper.style.display = 'none'
    })

}

function displayCoins () {
    let value = coins
    if (coins >= 10000) {
        value = Number.parseFloat(coins / 1000).toFixed(1) + 'k'
    } 
    if (coins >= 1000000) {
        value = Number.parseFloat(coins / 1000000).toFixed(1) + 'm' 
    }

    coinsCounter.innerHTML = value
}

function clicker () {
    coins += 1
    displayCoins()
}

function verifyItemAvailable (toCheck, section) {


    let result
    items[section].forEach(item => {
        if (item.url === toCheck) {
            if (item.locked) {
                if (coins < item.price) {
                    return result = false
                } else {
                    buyItem(item)
                    return result = true
                }
            }
            return result = true
        }
    })

    return result

}

function showAlert (msg) {

    const visibleAlert = document.querySelector('.alert')

    if (visibleAlert) {
        visibleAlert.remove()
    }

    const alertDiv = document.createElement('div')
    const alertClose = document.createElement('div')
    const alertMsg = document.createElement('p')

    alertDiv.classList.add('alert')
    alertClose.classList.add('cross')
    alertMsg.innerText = msg

    alertDiv.append(alertClose, alertMsg)
    document.querySelector('body').append(alertDiv)

    const timer = setTimeout(() => {
        alertDiv.remove()
    }, 5000)

    alertClose.addEventListener('click', () => {
        alertDiv.remove()
        clearTimeout(timer)
    })

}

function buyItem (item) {
    item.locked = false
    coins-=item.price
    openTab()
    displayCoins()
}

function passiveCoinsGeneration () {
    setInterval(() => {
        coins+=1
        displayCoins()
    }, 1000)
}
 

// Function calls
switchLightMode()
fullScreenActions()
displayCoins()