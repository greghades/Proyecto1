class Cl_cookies {
   set(cname, cValue = '', exDays = 7) {
      let d = new Date()
      d.setTime(d.getTime() + (exDays * 24 * 60 * 60 * 1000))
      let expires = `expires=${d.toUTCString()}`
      document.cookie = `${cname}=${cValue};${expires};path=/`
   }

   /**
    * @param cname
    * @returns {string}
    * source: https://www.w3schools.com/js/js_cookies.asp
    */
   get(cname) {
      let name = `${cname}=`,
         decodedCookie = decodeURIComponent(document.cookie),
         ca = decodedCookie.split(';')
      for (let i = 0; i < ca.length; i++) {
         let c = ca[i].trim()
         if (c.indexOf(name) === 0)
            return c.substring(name.length, c.length)
      }
      return ""
   }

   isSet(cname) {
      let name = `${cname}=`,
         decodedCookie = decodeURIComponent(document.cookie),
         ca = decodedCookie.split(';');
      for (let i = 0; i < ca.length; i++) {
         let c = ca[i].trim()
         if (c.indexOf(name) === 0)
            return true
      }
      return false
   }
}

class Cl_mainDiv {
   constructor({app}) {
      this.app = app
      this.btStart = document.getElementById('main_btStart')
      let oi = this
      this.btStart.onclick = function () {
         oi.app.loginModal.show()
      }
   }
}

class Cl_dbContacts extends Cl_cookies {
   constructor() {
      super()
      this.cookieName = 'demoAppContacts'
   }

   getList() {
      let contacts
      try {
         contacts = JSON.parse(this.get(this.cookieName))
      } catch (e) {
         contacts = []
      }
      return contacts
   }

   setList(list) {
      super.set(this.cookieName, JSON.stringify(list))
   }

   set(id, name, phone) {
      let contacts = this.getList(),
         contact = {name: name, phone: phone}
      for (let i in contacts)
         if (i === id)
            contacts[i] = contact
      if (contacts.length === 0)
         contacts.push(contact)
      this.setList(contacts)
   }

   add() {
      let contacts = this.getList()
      contacts.push({name: '', phone: ''})
      this.setList(contacts)
   }

   del(id) {
      let contacts = this.getList()
      contacts.splice(id, 1)
      this.setList(contacts)
   }
 
   orderByName(){
      let contac = document.querySelectorAll('#campo_contact') 
      let arN =[]
      let nombres=[]
      for( let i = 0;i<contac.length;i++){
          arN.push({
            nombre:`${document.querySelectorAll('#campo_contact .contacts_inName')[i].value}`,
            phone:`${document.querySelectorAll('#campo_contact .contacts_inPhone')[i].value}`
          })
      } 
     console.log(arN)
      for( let i = 0;i<=contac.length-1;i++){
            nombres.push(arN[i].nombre)
            nombres.sort()
            
      } 
      console.log(nombres)
      for( let i = 0;i<=contac.length-1;i++){
         document.querySelectorAll('#campo_contact .contacts_inName')[i].value = nombres[i]
         for( let j = 0;j<=contac.length-1;j++){
            if (arN[j].nombre == nombres[i]) {
               document.querySelectorAll('#campo_contact .contacts_inPhone')[i].value = arN[j].phone
            }
            
            
         } 
            
      } 
      
      
   }
  
}

class Cl_loginModal extends Cl_cookies {
   constructor({app}) {
      super()
      this.app = app
      this.inPassword = document.getElementById('login_inPassword')
      this.inPassword.type = 'password'
      this.btOk = document.getElementById('login_btOk')
      this.domModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(`login_modal`))
      this.password = this.getPassword()
      let oi = this
      this.btOk.onclick = function () {
         if (oi.inPassword.value === oi.getPassword()) {
            oi.app.loginModal.domModal.hide()
            oi.app.contactsModal.show()
         } else alert('Password incorrecto')
      }
   }

   getPassword() {
      if (!this.isSet('password')) {
         alert('¡BIENVENIDO!' + String.fromCharCode(10) +
            'Por favor introduce un password que usarás para acceder la APP.' + String.fromCharCode(10) +
            'Si lo olvidas, borra los cookies (Se perderán todos los contactos almacenados.).')
         let password = prompt('Introduce el password:')
         this.set('password', password, 365)
      }
      return this.get('password')
   }

   show() {
      this.domModal.show()
   }
}

class Cl_contactsModal {
   Cl_divContacts = class {
      Cl_divContact = class {
         constructor({app, owner, id, contact}) {
            this.app = app
            this.id = id
            this.inName = owner.getElementsByClassName('contacts_inName')[0]
            this.inName.value = contact.name
            this.inPhone = owner.getElementsByClassName('contacts_inPhone')[0]
            this.inPhone.value = contact.phone
            this.btDelete = owner.getElementsByClassName('contacts_btDelete')[0]
            this.btOrder = document.getElementById('ordenarBTN')
            this.btnDetalle = owner.getElementsByClassName('btnDetll')[0]
            
           
            let oi = this
            this.inName.oninput
               = this.inPhone.oninput = function () {
               oi.saveContact()
            }
            this.btDelete.onclick = function () {
               if (confirm('¿Seguro de eliminar el elemento?')) {
                  oi.app.dbContacts.del(oi.id)
                  oi.app.contactsModal.refresh()

               }
            }
             this.btnDetalle.onclick = function (e) {
               var modalDetallesCampos = document.querySelectorAll('#modalDetalles p')
               var nombres = e.target.parentElement.parentElement.children[0].children[0].children[1].value
               var telefono = e.target.parentElement.parentElement.children[1].children[0].children[1].value
               modalDetallesCampos[0].textContent = nombres
               modalDetallesCampos[1].textContent = telefono
              

            }
            
            this.btOrder.onclick = function () {

               oi.app.dbContacts.orderByName()
               
               
            }

            
         }

         saveContact() {
            this.app.dbContacts.set(this.id, this.inName.value, this.inPhone.value)
         }
      }

      constructor({app, owner}) {
         this.app = app
         this.owner = owner
         this.divContacts = document.getElementById('contacts_divContacts')
         this.divContactTemplate = this.divContacts.firstElementChild.cloneNode(true)
         this.clear()
         this.contacts = null
      }

      clear() {
         this.divContacts.innerHTML = ''
      }

      chargeItems() {
         this.clear()
         let itemPosition = 0,
            contacts = this.app.dbContacts.getList()
         for (let id in contacts) {
            let newDivContact = this.divContactTemplate.cloneNode(true)
            
            this.divContacts.appendChild(newDivContact)
            new this.Cl_divContact({
               app: this.app,
               owner: newDivContact,
               id: id,
               contact: contacts[id],
            })
         }
      }
   }

   constructor({app}) {
      this.app = app
      this.btnOrde = document.querySelector('select')
      this.domModal = bootstrap.Modal.getOrCreateInstance(document.getElementById(`contacts_modal`))
      this.divContacts = new this.Cl_divContacts({
         app: app,
         owner: this,
      })
      this.btAdd = document.getElementById('contacts_btAdd')
      let oi = this
      this.btAdd.onclick = function () {
         
         oi.app.dbContacts.add()
         oi.refresh()
      }

       

   }

   onload() {
      this.refresh()
   }

   refresh() {
      this.divContacts.chargeItems()
   }

   show() {
      this.domModal.show()
   }
}

class Cl_demoApp {
   constructor() {
      this.mainDiv = new Cl_mainDiv({app: this})
      this.dbContacts = new Cl_dbContacts({app: this})
      this.loginModal = new Cl_loginModal({app: this})
      this.contactsModal = new Cl_contactsModal({app: this})
      let oi = this
      document.onreadystatechange = () => {
         if (document.readyState === 'complete') {
            oi.contactsModal.onload()
         }
      }
   }
}

let demoApp = new Cl_demoApp()