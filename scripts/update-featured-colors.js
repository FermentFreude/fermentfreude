// mongosh script: Update featured block card colors to brand tones
// Run on both staging and production

var shopPage = db.pages.findOne({ 'layout.blockType': 'featuredProductCards' })
if (!shopPage) {
  print('No shop page with featuredProductCards found')
} else {
  var layoutIndex = -1
  for (var i = 0; i < shopPage.layout.length; i++) {
    if (shopPage.layout[i].blockType === 'featuredProductCards') {
      layoutIndex = i
      break
    }
  }

  if (layoutIndex === -1) {
    print('Block not found in layout')
  } else {
    var setObj = {}
    setObj['layout.' + layoutIndex + '.cardColors'] = [
      { color: '#4b4f4a' },
      { color: '#403c39' },
      { color: '#1a1a1a' },
    ]
    setObj['layout.' + layoutIndex + '.bannerColor'] = '#3a3e3a'

    var result = db.pages.updateOne({ _id: shopPage._id }, { $set: setObj })
    print('Updated colors: ' + JSON.stringify(result))
  }
}
