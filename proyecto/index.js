/**
 * 
 * Creamos la función serialize, que coniverte los datos de un formulario 
 * en un objeto JavaScript, la creamos fuera de cualquier clase, debido a 
 * que es algo que se requerira usar seguido y no acceder a la clase 
 * repetidamente
 */
let serialize = target =>
    /**
     * target: es el formualrio que fue enviado
     * target.elements: contiene todos los campos dentro del formulairo
     * Array.from(target.elements): convierte los campos en un array 
     * para poder recorrerlos con reduce
     */
    Array.from(target.elements).reduce((acc, el)=>{
        if(!el.name) return acc; //si el input no tiene un 'name', lo ignora
        acc[el.name] = el.value;
        return acc;
    },{})
/**
 * Vamos a necesitar un lugar que sea el encargado de poder gestionar todos
 * nuestros usuarios
 */

/**
 * Creamos una clase de User
 */

class User{
    //Accedemos a la url y la hacemos privada
    static #url='https://jsonplaceholder.typicode.com/users';
    static #users=[];
    static #ul=document.createElement('ul');//Inicializamos aquí para solo
    //crear una sola lista
    static #form=document.createElement('form');
    static #initialValues={
        name:'',
        email:'',
    }

    //Método Constructor
    constructor(data){
        this.name=data.name;
        this.email=data.email;
    }

    //Método para traer los usuarios de la Api, que tiene que ser estátio para
    //poder acceder a la URL, pero además vamos estar trabjando con Fetch por
    //lo que lo tenemos que transformar en un método 'Async'
    static async getAll(){
        //Envolvemos todo en un tryCatch
        try {
            const response = await fetch(this.#url);
            //Comprobamos si esta bien
            if(!response.ok){
                throw response;//Lanzamos response si no se encuentra bien
            };
            //Transformamos la respuesta en un Objeto Json
            this.#users = await response.json();
            return this.#users;
            /**
             * Es recomendable la referencia de los usuarios en una sola
             * memoria, para no volver a llamar
             */
        } catch (error) {
            console.lof('Error', e)
        }
    }
    /**
     * Creando Listados
     */
    static renderUser(u){
        //Creamos el elemento de 'li'
        let li=document.createElement('li');
        //Le asignamos al Li un texto
        li.innerText=u.name;
        return li;
    }

    static render(){
        //Crearemos el elemento, sin embargo si lo creamos dentro del 
        //método este creara un nuevo listado al llamarlo, por lo que solo
        //lo creamos una vez en el principio
        //this.#ul = document.createElement('ul');
        //Vamos a necesitar una referencia de los usuarios
        let users = this.#users;
        //Le agregamos a cada usuario la plantilla, por lo que implemenetamos
        //un método para agregar el Nodo de 'li'
        users.forEach(u=>this.#ul.appendChild(this.renderUser(u)))

        return this.#ul;
    }


    /**
     * Creando Formulario
     *  Cuando renderizemos el formulario vamos a necesitar un par de cosas
     * -onsubmit:cuando envia el formulario
     * -initials values
     * -mensajes de error
     * -innerhtml
     */
    static onsubmit(elemento){
        //Prevenimos el comportamiento del evento de Onsubmit
        elemento.preventDefault();
        let data = serialize(elemento.target);//Convierte los datos del 
        //formulario en un objeto
        let user = new User(data);//Creamos una nueva instancia de un Usuario,
        //por lo que tenemos que crear un constructor

        const errors = user.validate();//Validamos los datos de la nueva
        //instancia del usuario por lo que no puede ser estatico

        if(Object.keys(errors).length >0){
            //Si hay error renderizarlos, pero sin embargo, necesitamos
            //cambiar el contexto de this, debido a que hace referencia 
            //al html
            this.#form.innerHTML=this.forHTML({data, errors});
            return;
        }
        //guardar el usuario con método de la instancia
        user.save();

        //Guardando el usuario con el método estaticp
        user.save(user);


    }

    //Método Save de la instancia, solo llamariamos el método estático,
    //permitiendo que cada objeto User guarde sus porpios datos
    save(){
        return User.save(this);
    }

    //Método estattico save: maneja la lógica de almacenamiento en la Apis 
    static async save(user){
        //Como llamamos una api usamos el async
        try {
            //capturamos la respuesta
            const response=await fetch(this.#url, {
                method: 'POST',//utilizamos post debido a que estamos creando
                //nuevo usuario
                headers:{'Content-Type': 'application/json'},
                body:JSON.stringify(user)
            });
            //tranformamos los datos de la api en un Json
            const data = await response.json();
            //Lo agregamos al listado de usuarios
            this.#users.unshift(data);
            //Lo agregamos al comienzo del listado html, gracias el método 
            //prepend
            this.#ul.prepend(this.renderUser(data));

        } catch (error) {
            console.log('errors', error)
        }
    }

    //Método validate
    validate(){
        let errors={};
        if(!this.name){
            errors.name='Nombre es obligatorio';
        }
        if(!this.email){
            errors.email='Correo es obligatorio';
        }

        return errors;
    }


    //Método estatico para poder obtener el HTML del formulario, en donde
    //le pasamos en Data los valores iniciales y errors para la posible
    //validacioón de los campos
    static forHTML({data, errors}){
        return `
        <form>
            <div>
                <label>Nombre:</label>
                <input name="name" value="${data.name}">
                ${errors.name || ""}
            </div>
             <div>
                <label>Correo:</label>
                <input name="email" value="${data.email}">
                ${errors.email || ""}
            </div>
            <input type="submit" value="Enviar">
        </form>
        `
    }
    static renderForm(){
        //Llamamos al formulario y reemplazamos su método de onsubmit
       this.#form.onsubmit = this.onsubmit.bind(this);//cambiamos contexto de this
       //Le agregamos la plantilla del HTML
       this.#form.innerHTML=this.forHTML({
        data:this.#initialValues,
        errors:{},
       });

       return this.#form;
    }
}


async function main() {
    const users = await User.getAll();
    /**
     * Ahora lo que vamos hacer es crear un método que lo que hará, es pasarle
     * un listado de usuarios y pasarle una plantilla de html. Por lo que 
     * haremos un método static para esto.
     */ 
    const template=User.render();//Esto debería devolver un nodo
    /**
     * Agregaremos el listado de usuarios al DOM
     */
    const form=User.renderForm();
    document.body.insertAdjacentElement('afterbegin', template);
    document.body.insertAdjacentElement('afterbegin', form);
}

main();