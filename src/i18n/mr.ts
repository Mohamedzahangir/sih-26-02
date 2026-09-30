import type { TranslationKey } from './en';

export const mr: Partial<Record<TranslationKey, string>> = {
  /* ------------------------------- navigation ------------------------------ */
  'nav.home': 'मुख्यपृष्ठ',
  'nav.archive': 'संकलन एक्सप्लोर',
  'nav.timeline': 'कालरेषा',
  'nav.tagline': 'डिजिटल वारसा संकलन',
  'nav.primary': 'प्राथमिक नेव्हिगेशन',
  'nav.mobile': 'मोबाइल',
  'nav.menu.open': 'मेनू उघडा',
  'nav.menu.close': 'मेनू बंद करा',
  'nav.current': 'सध्याचे पृष्ठ: {path}',

  /* --------------------------- language + generic -------------------------- */
  'lang.select': 'भाषा निवडा',
  'lang.note':
    'भाषा कियोस्कवर लगेच लागू होते. कोणत्याही नोंदीतील दस्तऐवज मजकूराचे अनुवाद करता येते.',
  'lang.original': 'मूळ',

  'common.open': 'उघडा',
  'common.close': 'बंद करा',
  'common.closeDialog': 'संवाद बंद करा',
  'common.home': 'मुख्यपृष्ठ',
  'common.back': 'मागे',
  'common.archive': 'संकलन',
  'common.clear': 'शोध काढा',
  'common.reset': 'रीसेट',
  'common.sample': 'नमुना',
  'common.records': 'नोंदी',

  /* ---------------------------- accessibility ------------------------------ */
  'a11y.open': 'प्रवेशयोग्यता पर्याय',
  'a11y.title': 'प्रवेशयोग्यता',
  'a11y.large.label': 'मोठा मजकूर',
  'a11y.large.hint': 'दूरून पाहण्यासाठी इंटरफेसचे प्रमाण वाढवते',
  'a11y.contrast.label': 'उच्च कॉन्ट्रास्ट',
  'a11y.contrast.hint': 'मजबूत मजकूर आणि काठ कॉन्ट्रास्ट',
  'a11y.motion.label': 'गती कमी करा',
  'a11y.motion.hint': 'ट्रान्झिशन आणि अनिमेशन बंद करते',
  'a11y.note': 'प्राधान्ये फक्त या कियोस्क टर्मिनलवर साठवली जातात.',

  /* ------------------------------- kiosk home ------------------------------ */
  'home.kicker': 'डिजिटल वारसा संकलन',
  'home.title.1': 'शोधा डॉ. बी. आर. आंबेडकरची',
  'home.title.2': 'अमूल्य वारसा',
  'home.desc':
    'हस्तलिपी, लेख, भाषणे आणि ऐतिहासिक नोंदी एक इमर्सिव्ह डिजिटल संकलनातून शोधा.',
  'home.cta.archive': 'संकलन एक्सप्लोर करा',
  'home.cta.timeline': 'कालरेषा पहा',
  'home.stats.records': 'नोंदी',
  'home.stats.collections': 'संकलने',
  'home.stats.timeline': 'कालरेषा नोंदी',

  'home.collections.eyebrow': 'संकलनानुसार ब्राउझ करा',
  'home.collections.title': 'संकलनाचा सराव करा',
  'home.collections.desc':
    'चार स्थिर संकलने या संकलनाचा मुळ आहेत. संकलन निवडा — डिजिटल संकलन त्याच फिल्टरसह उघडेल.',
  'tile.open': 'संकलन उघडा',

  'home.featured.eyebrow': 'संकलनातून निवड',
  'home.featured.title': 'विशेष नोंदी',
  'home.featured.desc': 'संकलन उघडण्यासाठी निवडलेल्या तीन नोंदी.',
  'home.featured.viewAll': 'सर्व नोंदी पहा',

  'home.quick.eyebrow': 'भौतिक प्रदर्शने',
  'home.quick.title': 'वारसा प्रवेश',
  'home.quick.desc':
    'छापलेली प्रदर्शन किंवा कागदी दस्तऐवज डिजिटल संकलनाशी जोडा. दोन्ही प्रवाह याच मॉकअपमध्ये चालतात.',
  'home.quick.scan.label': 'क्यूआर स्कॅन',
  'home.quick.scan.title': 'क्यूआर स्कॅन करा',
  'home.quick.scan.desc': 'प्रदर्शन कोडवर पॉईंट करा आणि त्याची वारसा नोंद उघडा.',
  'home.quick.scan.cta': 'स्कॅनर उघडा',
  'home.quick.ocr.label': 'दस्तऐवज डिजिटलाइझ',
  'home.quick.ocr.title': 'दस्तऐवज डिजिटलाइझ करा',
  'home.quick.ocr.desc': 'दस्तऐवज सिम्युलेटेड OCR मधून चालवा आणि मजकूराचे अनुवाद करा.',
  'home.quick.ocr.cta': 'OCR सुरू करा',

  /* ------------------------------- archive --------------------------------- */
  'archive.eyebrow': 'संकलन · {n} नोंदी',
  'archive.title': 'डिजिटल संकलन',
  'archive.desc': 'दस्तऐवज, हस्तलिपी आणि ऐतिहासिक नोंदींचा सराव करा.',
  'archive.search': 'वारसा संकलनात शोधा…',
  'archive.filter': 'फिल्टर',
  'archive.count.one': '{n} नोंद',
  'archive.count.other': '{n} नोंदी',
  'archive.results.in': 'मध्ये',
  'archive.results.matching': 'जुळणारे: “{q}”',
  'archive.empty.title': 'नोंदी सापडल्या नाहीत',
  'archive.empty.desc':
    'संकलनात हा शोध जुळत नाही. दुसरा शब्द वापरून पहा, किंवा संपूर्ण संकलन पाहण्यासाठी फिल्टर रीसेट करा.',
  'archive.reset': 'शोध आणि फिल्टर रीसेट करा',
  'archive.newBadge': 'या सत्रात जोडले',

  /* ------------------------------ categories ------------------------------- */
  'cat.all': 'सर्व',
  'cat.manuscripts': 'हस्तलिपी',
  'cat.writings': 'लेख',
  'cat.speeches': 'भाषणे',
  'cat.photographs': 'छायाचित्रे',
  'cat.historical-documents': 'ऐतिहासिक दस्तऐवज',

  'tile.manuscripts.blurb': 'हस्तलिखित पाने, मसुदे आणि टीपा असलेली पाने',
  'tile.writings.blurb': 'प्रकाशित पत्रे, पुस्तके आणि कार्य मजकूर',
  'tile.speeches.blurb': 'संबोधने, कार्यवाही आणि घटना नोंदवही',
  'tile.photographs.blurb': 'चित्रे, गटचित्रे आणि अधिकृत गट',

  /* ----------------------------- document viewer --------------------------- */
  'doc.back': 'डिजिटल संकलनात परत',
  'doc.kicker': 'दस्तऐवज',
  'doc.badge.sample': 'नमुना नोंद',
  'doc.meta.date': 'दिनांक',
  'doc.meta.type': 'दस्तऐवज प्रकार',
  'doc.meta.language': 'भाषा',
  'doc.meta.source': 'स्रोत',
  'doc.meta.tags': 'टॅग',
  'doc.caption.default': 'संग्रहित छायाचित्र, मॉकअप संकलन.',
  'doc.caption.plate': 'डिजिटलाइझ संदर्भ प्रत · छायाचित्र प्लेट {code}',

  'doc.action.fullscreen': 'पूर्ण स्क्रीन पहा',
  'doc.action.fullscreenImage': 'छायाचित्र पूर्ण स्क्रीनवर पहा',
  'doc.action.read': 'मजकूर वाचा',
  'doc.action.ask': 'याविषयी विचारा',

  'doc.text.eyebrow': 'OCR · सिम्युलेटेड',
  'doc.text.title': 'दस्तऐवज मजकूर',
  'doc.text.desc':
    'डिजिटलाइझ पान्यातून काढलेला मजकूर. या मॉकअपमध्ये हे पॅनेल प्रात्यक्षिकासाठी नमुना आउटपुट दर्शवते.',
  'doc.text.open': 'वाचन दृश्य उघडा',
  'doc.text.extracted': 'काढलेला मजकूर · प्लेट {code}',
  'doc.text.originalLabel': 'मूळ मजकूर',
  'doc.text.translatedLabel': 'अनुवादित मजकूर',
  'doc.text.mockBadge': 'मॉक अनुवाद · नमुना',
  'doc.text.unavailable': 'या नोंदीचे अनुवाद उपलब्ध नाही — मूळ मजकूर दाखवत आहे.',
  'doc.text.mockNote':
    'मॉकअप टीप — अनुवाद स्थानिकरित्या साठवलेला मॉक मजकूर आहे. कोणतीही अनुवाद सेवा कॉल केलेली नाही.',

  'doc.digital.title': 'डिजिटल प्रवेश',
  'doc.digital.desc': 'या नोंदीपर्यंत पोहोचण्यासाठी क्यूआर स्कॅन करा',
  'doc.digital.code': 'प्रदर्शन कोड',
  'doc.digital.cta': 'स्कॅनर उघडा',
  'doc.digital.note': 'क्यूआर नमुना · मॉकअप',

  'doc.related.eyebrow': 'पुढे सराव करा',
  'doc.related.title': 'संबंधित नोंदी',
  'doc.related.desc': 'त्याच संकलनातील आणि जवळच्या संकलनातील आणखी नोंदी.',

  'doc.notfound.kicker': 'नोंद उपलब्ध नाही',
  'doc.notfound.title': 'ही नोंद सापडली नाही',
  'doc.notfound.desc': 'ओळख कोड {id} मॉकअप संकलनातील कोणत्याही नोंदीशी जुळत नाही.',
  'doc.notfound.back': 'संकलनात परत',

  'doc.modal.fullscreen.subtitle': 'पूर्ण स्क्रीन प्लेट',
  'doc.modal.read.subtitle': 'वाचन दृश्य',
  'doc.modal.read.warning': 'नमुना काढलेला मजकूर — पडताळलेले प्रतिलेख नाही',

  'doc.ask.title': 'या नोंदीविषयी विचारा',
  'doc.ask.subtitle': 'संकलनाला विचारा',
  'doc.ask.desc':
    'संकलनाविरुद्ध नैसर्गिक भाषेतील प्रश्न पुढील टप्प्यात उपलब्ध होतील. खालील प्रश्न या नोंदीने पुनर्प्राप्ती आणि अनुवाद जोडल्यावर कोणत्या चौकशींना पाठिंबा देईल याचे उदाहरण आहेत.',
  'doc.ask.q1': 'या संकलनातील कोणत्या नोंदी संविधानाचा उल्लेख करतात?',
  'doc.ask.q2': '१९४० च्या दशकातील सर्व हस्तलिपी दाखवा.',
  'doc.ask.q3': 'या दस्तऐवजाशी संबंधित कोणती छायाचित्रे आहेत?',
  'doc.ask.note':
    'मॉकअप टीप — हे पॅनेल सांकेतिक आहे. या बिल्डमध्ये AI सेवा किंवा बाह्य API कॉल केले जात नाही.',

  /* -------------------------------- timeline -------------------------------- */
  'timeline.eyebrow': 'कालरेषा · {n} नोंदी',
  'timeline.title': 'इतिहासातील प्रवास',
  'timeline.desc':
    'एका शतकाची टप्पे, प्रत्येक नोंद तिले नोंदवणाऱ्या दस्तऐवजांशी जोडलेली आहे. संपूर्ण तपशील उघडण्यासाठी नोंद निवडा.',
  'timeline.cta.archive': 'संकलन एक्सप्लोर करा',
  'timeline.cta.home': 'कियोस्कवर परत',
  'timeline.end': 'कालरेषेचा शेवट · {year}',
  'timeline.related': 'संबंधित संकलन नोंद',

  /* ---------------------------------- scan ---------------------------------- */
  'scan.kicker': 'टप्पा 2 · क्यूआर प्रवेश',
  'scan.title': 'वारसा क्यूआर कोड स्कॅन करा',
  'scan.desc': 'दस्तऐवज किंवा प्रदर्शनीशी जोडलेल्या क्यूआर कोडवर आपला कॅमेरा नेमा.',
  'scan.frame.aria': 'क्यूआर स्कॅनिंग फ्रेम',
  'scan.startCamera': 'कॅमेरा सुरू करा',
  'scan.demo': 'डेमो क्यूआर वापरा',
  'scan.tryAgain': 'पुन्हा प्रयत्न करा',
  'scan.back': 'कियोस्कवर परत',
  'scan.demoHint': 'डेमो मोडला कॅमेराची आवश्यकता नाही आणि तो नेहमी पूर्ण होतो.',
  'scan.status': 'स्कॅनर स्थिती',

  'scan.state.idle': 'स्कॅन करण्यासाठी तयार',
  'scan.state.scanning': 'Scanning...',
  'scan.state.detecting': 'Detecting QR...',
  'scan.state.detected': 'QR detected',
  'scan.state.opening': 'Opening archive record...',
  'scan.state.camera': 'क्यूआर कोड शोधत आहे…',
  'scan.state.notDetected': 'क्यूआर सापडला नाही',

  'scan.camera.denied': 'कॅमेरा परवानगी नाकारली',
  'scan.camera.unavailable': 'कॅमेरा उपलब्ध नाही',
  'scan.camera.desc':
    'या कियोस्क ब्राउझरने कॅमेरा प्रवेश दिला नाही. प्रात्यक्षिक पूर्ण करण्यासाठी डेमो मोड सुरू ठेवा.',
  'scan.notDetected.desc':
    'दृश्यात वाचण्यायोग्य क्यूआर कोड सापडला नाही. कोड फ्रेमच्या आत ठेवा, किंवा डेमो मोडने सुरू ठेवा.',
  'scan.toast': 'वारसा नोंद यशस्वीरित्या जोडली.',

  /* ---------------------------------- ocr ----------------------------------- */
  'ocr.kicker': 'टप्पा 2 · OCR',
  'ocr.title': 'वारसा दस्तऐवज डिजिटलाइझ करा',
  'ocr.desc':
    'स्कॅनर बेडवर दस्तऐवज ठेवा आणि सिम्युलेटेड ओळख पाइपलाइन चालवून शोधता येण्यायोग्य, अनुवादता येण्यायोग्य मजकूर मिळवा.',
  'ocr.preview': 'दस्तऐवज पूर्वदृश्य',
  'ocr.output': 'OCR आउटपुट',
  'ocr.idle': 'सुरू करण्यासाठी दस्तऐवज ठेवा किंवा स्कॅन करा.',
  'ocr.waiting': 'दस्तऐवजासाठी प्रतीक्षा…',
  'ocr.start': 'OCR सुरू करा',
  'ocr.processing': 'दस्तऐवज प्रक्रिया',

  'ocr.step.1': 'दस्तऐवज ओळखला',
  'ocr.step.2': 'प्रत पूर्वप्रक्रिया',
  'ocr.step.3': 'मजकूर ओळखत आहे',
  'ocr.step.4': 'सामग्री काढत आहे',
  'ocr.step.5': 'डिजिटल नोंद तयार होत आहे',

  'ocr.done': 'दस्तऐवज डिजिटलाइझ झाला',
  'ocr.result.original': 'मूळ दस्तऐवज',
  'ocr.result.extracted': 'काढलेला मजकूर',
  'ocr.result.translated': 'अनुवादित मजकूर',
  'ocr.result.language': 'ओळखलेली भाषा',
  'ocr.result.confidence': 'विश्वासार्हता',
  'ocr.result.type': 'दस्तऐवज प्रकार',
  'ocr.result.date': 'दिनांक',
  'ocr.result.tags': 'टॅग',
  'ocr.result.sample': 'सिम्युलेटेड OCR आउटपुट — पडताळलेले प्रतिलेख नाही',

  'ocr.add': 'डिजिटल संकलनात जोडा',
  'ocr.added': 'संकलनात जोडले',
  'ocr.viewInArchive': 'संकलनात पहा',
  'ocr.again': 'दुसरा दस्तऐवज स्कॅन करा',
  'ocr.toast': 'दस्तऐवज यशस्वीरित्या वारसा संकलनात जोडला.',

  'ocr.error.title': 'OCR प्रक्रिया अपयशी',
  'ocr.error.desc':
    'ओळख टप्पा पूर्ण झाला नाही. काहीही गमावले नाही — पुन्हा स्कॅन करा किंवा डेमो मोड सुरू ठेवा.',
  'ocr.retry': 'पुन्हा प्रयत्न',
  'ocr.useDemo': 'डेमो मोड वापरा',

  /* --------------------------------- footer --------------------------------- */
  'footer.tagline': 'डिजिटल वारसा संकलन',
  'footer.about':
    'भौतिक वारसा प्रदर्शने शोधता येण्यायोग्य डिजिटल संकलनाशी जोडणारा संवादात्मक सार्वजनिक टचस्क्रीन कियोस्क.',
  'footer.navigate': 'नेव्हिगेट करा',
  'footer.scan': 'क्यूआर स्कॅन',
  'footer.ocr': 'दस्तऐवज डिजिटलाइझ करा',
  'footer.credits': 'छायाचित्र क्रेडिट व अस्वीकृती',
  'footer.phase': 'SIH 2026 · मॉकअप टप्पा 2',
  'footer.meta': 'फ्रंटएंड प्रात्यक्षिक · बॅकएंड नाही · स्थानिक मॉक डेटा',
  'notfound.kicker': '404 · सापडले नाही',
  'notfound.title': 'ही गॅलरी अस्तित्वात नाही',
  'notfound.desc':
    'तुम्ही विनंती केलेले पान अंबेडकर हेरिटेज हब किओस्कचा भाग नाही. प्रवेशद्वाराकडे परता किंवा डिजिटल संकलनात पुढे जा.',
  'notfound.cta.home': 'किओस्क मुख्यपृष्ठ',
  'notfound.cta.archive': 'संकलन पहा',
};
