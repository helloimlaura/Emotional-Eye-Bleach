// utility functions

function promisifiedGetBannedUrls (key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, (result) => {
      resolve(result.bannedUrls)
    })
  })
}

function promisifiedSetStorage (keyValueObj) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(keyValueObj, () => {
      console.log('New value set')
      resolve()
    })
  })
}

let defaultUrl = ['*://www.4chan.org/*'];

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    bannedUrls: defaultUrl
  }, function () {
    console.log('You have banned *://www.4chan.org/*');
  });
});

async function setDefault() {
  let current = await promisifiedGetBannedUrls(['bannedUrls'])
  console.log(current)
  if (!current) {
    chrome.storage.sync.set({
      bannedUrls: defaultUrl
    }, function () {
      console.log('The default ban is www.4chan.org.');
    });
  }
}

let patterns

async function updatePatterns() {
  patterns = await promisifiedGetBannedUrls(['bannedUrls'])
}

const webcomics = [
  'http://nedroid.com/2006/02/2008-hoops/',
  'http://nedroid.com/2018/08/everybodys-free/',
  'http://www.harkavagrant.com/index.php?id=354',
  'https://zacgorman.com/',
  'http://moonbeard.com/2011/04/moon/',
  'http://www.qwantz.com/index.php',
  'http://romanticallyapocalyptic.com/8b',
  'http://gunshowcomic.com/532',
  'http://www.boasas.com/',
  'https://www.ohjoysextoy.com/',
  'https://www.questionablecontent.net/view.php?comic=3274',
  'http://www.asofterworld.com/',
  'http://drmcninja.com/archives/comic/33p01/',
  'http://overcompensating.com/oc/index.php?comic=3',
  'http://www.smbc-comics.com/comic/2012-10-16',
  'http://pbfcomics.com/comics/durab-inc/',
  'http://mutantmagic.com/post/76669680805/from-the-vault-happy-v-day-if-you-observe-it',
  'http://studygroupcomics.com/main/black-is-the-color-by-julia-gfrorer/',
  'http://hyperboleandahalf.blogspot.com/2013/05/depression-part-two.html',
  'http://emcarroll.com/comics/faceallred/01.html',
  'https://www.instagram.com/bigsis666/',
  'http://www.octopuspie.com/2007-05-14/001-pea-wiggle/',
  'http://www.destructorcomics.com/?page_id=41'
];

function redirect(requestDetails) {
  console.log('Redirecting: ' + requestDetails.url);
  return {
    redirectUrl: webcomics[Math.floor(Math.random() * webcomics.length)]
  }
}

async function addListeners() {
  await setDefault()
  await updatePatterns()
  console.log("in addListeners", patterns)
  patterns.forEach(
    url => chrome.webRequest.onBeforeRequest.addListener(
      redirect, {
        urls: [url]
      },
      ['blocking']
    )
  )
}

addListeners()

async function loadUrls() {
  let bannedUrls = await promisifiedGetBannedUrls(['bannedUrls'])
    for (const url in bannedUrls) {
      if (bannedUrls === undefined || !url.includes('facebook') || !url.includes('instagram') || !url.includes('twitter')) {
        await promisifiedSetStorage({bannedUrls: ['*://www.4chan.org/*']}, function(){'Sorry, we can only redirect from facebook, instagram, and twitter at this time.'})
      }
    }
}

async function saveOptions(event) {
  console.log('IN SAVE')
  event.preventDefault()
  let bannedUrls = []

  let twitter = document.getElementById('twitter').value;
  let facebook = document.getElementById('facebook').value;
  let instagram = document.getElementById('instagram').value;

  console.log(document.getElementById('twitter').value)

  twitter && bannedUrls.push(twitter)
  facebook && bannedUrls.push(facebook)
  instagram && bannedUrls.push(instagram)

  await promisifiedSetStorage({bannedUrls: bannedUrls})
  await addListeners()
}

function eraseOptions() {
  chrome.storage.sync.remove('bannedUrls', function() {'Removed banned urls'})
}

document.addEventListener('DOMContentLoaded', function() {
  console.log("LOADED: ", document.getElementsByTagName('h1').value)
  let body = document.getElementById('load');
  let save = document.getElementById('save');
  let erase = document.getElementById('erase');

  body && body.addEventListener('load', loadUrls);
  save && save.addEventListener('click', saveOptions);
  erase && erase.addEventListener('click', eraseOptions);
});
