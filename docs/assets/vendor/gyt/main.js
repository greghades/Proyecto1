class ClTewUtil {
   constructor() {
   }

   get txtTip() {
      let result = {}
      result.txtSendContactOk = 1
      result.txtSendContactFail = 2
      return result
   }

   get browserLang() {
      let lang = navigator.language.split('-')[0];
      if (!this.tewlanguages.includes(lang)) lang = 'en'
      return lang
   }

   get pageLang() {
      return document.getElementsByTagName('html')[0].lang || 'en'
   }

   get tewlanguages() {
      return ['en', 'es', 'pt', 'sq']
   }

   tipMsg(tipId, lang = this.pageLang) {
      let result
      if (!this.tewlanguages.includes(lang)) lang = 'en'
      if (tipId === this.txtTip.txtSendContactOk)
         result = {
            'en': 'Message was sent successfully to: *email*',
            'es': 'Mensaje enviado exitosamente a: *email*',
            'pt': 'A mensagem foi enviada com sucesso para: *email*',
            'sq': 'Mesazhi u dërgua me sukses te: *email*'
         }
      else if (tipId === this.txtTip.txtSendContactFail)
         result = {
            'en': 'Error sending message: *error*',
            'es': 'Error enviando el mensaje: *error*',
            'pt': 'Erro ao enviar mensagem: *error*',
            'sq': 'Gabim në dërgimin e mesazhit: *error*'
         }
      else result = {
            'en': 'NO MESSAGE DEFINED',
            'es': 'NO HAY MENSAJE DEFINIDO',
            'pt': 'NENHUMA MENSAGEM DEFINIDA',
            'sq': 'ASNJE MESAZH I PFRCAKTUAR'
         }
      return result[lang]
   }

   modelDo({
              formDataSrc = null,
              phpURL = null,
              op = null,
              ajaxuResult = null,
              params = null,
              getPercent = null,
           }
   ) {
      let formData = new FormData(formDataSrc)
      formData.append('Op', op)
      for (let key in params)
         if (params.hasOwnProperty(key) && params[key] !== null)
            formData.append(key, params[key]);
      $.ajax({
            url: phpURL,
            type: "POST",
            // dataType: "html",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            xhr: function () {
               let xhr = new window.XMLHttpRequest()
               xhr.upload.addEventListener("progress", function (evt) {
                  if (evt.lengthComputable) {
                     let percentComplete = evt.loaded / evt.total
                     percentComplete = parseInt(percentComplete * 100)
                     if (getPercent)
                        getPercent(percentComplete)
                  }
               }, false)
               return xhr
            }
         }
      ).done(function (ajaxResponse) {
            let response = null, error, result = null
            try {
               response = JSON.parse(ajaxResponse)
               if (!response)
                  error = 'modelDo - JSON null received'
               else {
                  error = response.Error
                  result = response.r
               }
            } catch (e) {
               error = 'modelDo - Invalid JSON string received'
            }
            ajaxuResult({
               rajaxuError: error,
               rajaxuResult: result
            })
         }
      ).fail(function (jqXHR, textStatus, errorThrown) {
         let error = null
         if (jqXHR.status === 0)
            error = 'Not connect: Verify Network.'
         else if (jqXHR.status === 404)
            error = 'Requested page not found [404]'
         else if (jqXHR.status === 500)
            error = 'Internal Server Error [500].'
         else if (textStatus === 'parsererror')
            error = 'Requested JSON parse failed.'
         else if (textStatus === 'timeout')
            error = 'Time out error.'
         else if (textStatus === 'abort')
            error = 'Ajax request aborted.'
         else
            error = 'Uncaught Error: ' + jqXHR.responseText
         ajaxuResult({
            rajaxuError: error
         })
      })
   }

   sendContactInfo(form, subject, fromName = '') {
      event.preventDefault()
      let oi = this,
         submitter = event.submitter,
         submitterInnerHTML = submitter.innerHTML
      submitter.innerHTML = '<i><b>...processing...</b></i>'
      // submitter.disabled = true
      this.modelDo({
         formDataSrc: form,
         phpURL: 'https://theeasyweb.net/forms/Cntrlr.php',
         op: 'APP_TEW_sendMsgToSubscriber',
         params: {
            formSubject: subject,
            fromName: fromName,
            formReferer: window.location.href,
         },
         getPercent(percent) {
            submitter.innerHTML = `<i><b>...processing: ${percent - 1}%...</b></i>`
         },
         ajaxuResult(result) {
            if (result.rajaxuError)
               alert(oi.tipMsg(oi.txtTip.txtSendContactFail).replace('*error*', result.rajaxuError))
            else alert(oi.tipMsg(oi.txtTip.txtSendContactOk).replace('*email*', result.rajaxuResult.emailedTo))
            form.reset()
            // submitter.disabled = false
            submitter.innerHTML = submitterInnerHTML
         }
      })
      for (let elem of form.elements)
         elem.disabled = true
   }

   getCookie(cname) {
      let name = cname + "=",
         decodedCookie = decodeURIComponent(document.cookie),
         ca = decodedCookie.split(';')
      for (let i = 0; i < ca.length; i++) {
         let c = ca[i]
         while (c.charAt(0) === ' ')
            c = c.substring(1)
         if (c.indexOf(name) === 0)
            return c.substring(name.length, c.length)
      }
      return ""
   }

   setCookie(cname, cValue, exDays) {
      let d = new Date()
      d.setTime(d.getTime() + (exDays * 24 * 60 * 60 * 1000))
      let expires = `expires=${d.toUTCString()}`
      document.cookie = `${cname}=${cValue};${expires};path=/`
   }
}

tewUtil = new ClTewUtil()