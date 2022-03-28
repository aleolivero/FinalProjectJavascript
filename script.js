const tomar_datos = () =>{


  var datos_tomar = localStorage.getItem('datos') ?  JSON.parse(localStorage.getItem('datos')) : []

  return datos_tomar
}

class Serie {
  constructor(){
    this.eje_x = []
    this.eje_y = []
    this.eje_y_ajustado = []
  }

  agregar_valor_x(x){
    this.eje_x.push(x)
  }
  agregar_valor_y(y){
    this.eje_y.push(y)
  }
  agregar_valor_y_ajustado(y_ajustado){
    this.eje_y_ajustado.push(y_ajustado)
  }

  agregar_serie_y_ajustada(valor_fijo,valor_porcentual,...serie_y){
    
    serie_y.map( (y)=>{y != null && this.eje_y_ajustado.push((y+valor_fijo)*(1+valor_porcentual))})
  }

}


// HANS ON TABLE
const container = document.getElementById('dataTable');

var hot = new Handsontable(container, {
  data:tomar_datos(),
  colHeaders: ['Period', 'Value'],
  colWidths: 125,
  rowWidths: 25,
  startRows: 5,
  startCols: 5,
  height: 100,
  width: 300,
  minSpareRows: 1,
  licenseKey: 'non-commercial-and-evaluation',
  columns: [
    {
        type: 'date',
        dateFormat: 'DD/MM/YYYY',
        correctFormat: true,
        defaultDate: '01/01/2022',
        // datePicker additional options
        // (see https://github.com/dbushell/Pikaday#configuration)
        datePickerConfig: {
          // First day of the week (0: Sunday, 1: Monday, etc)
          firstDay: 0,
          showWeekNumber: true,
          numberOfMonths: 3,
          licenseKey: 'non-commercial-and-evaluation',
        }
      },
    {
      type: 'numeric',
      numericFormat: {
        pattern: '0,0.00'
      }
    }
  ]

});


// Boton Guardar Storage
let boton_cargar = document.getElementById('cargar_api')

boton_cargar.addEventListener('click', () => {

  
  fetch('https://apis.datos.gob.ar/series/api/series/?ids=168.1_T_CAMBIOR_D_0_0_26&start_date=2018-07&limit=100')
  .then((response)=> response.json())
  .then((json)=> {
  
  var datos_api = json.data
  console.log(datos_api)

  hot.destroy()

  hot = new Handsontable(container, {
    data:datos_api,
    colHeaders: ['Period', 'Value'],
    colWidths: 125,
    rowWidths: 25,
    startRows: 5,
    startCols: 5,
    height: 100,
    width: 300,
    minSpareRows: 1,
    licenseKey: 'non-commercial-and-evaluation',
    columns: [
      {
          type: 'date',
          dateFormat: 'DD/MM/YYYY',
          correctFormat: true,
          defaultDate: '01/01/2022',
          // datePicker additional options
          // (see https://github.com/dbushell/Pikaday#configuration)
          datePickerConfig: {
            // First day of the week (0: Sunday, 1: Monday, etc)
            firstDay: 0,
            showWeekNumber: true,
            numberOfMonths: 3,
            licenseKey: 'non-commercial-and-evaluation',
          }
        },
      {
        type: 'numeric',
        numericFormat: {
          pattern: '0,0.00'
        }
      }
    ]
  
  });
    
  
  })

})

// Boton Guardar Storage
let boton_guardar = document.getElementById('guardar')

boton_guardar.addEventListener('click', () => {

  var datos_guardar = JSON.stringify(hot.getData())
localStorage.setItem('datos',datos_guardar)

Toastify({
  text: "Datos guardados con exito.",
  className: "info",
  style: {
    background: "linear-gradient(to right, #00b09b, #96c93d)",
  }
}).showToast();


})


// Boton Limpiar Storage
let boton_limpiar = document.getElementById('limpiar')

boton_limpiar.addEventListener('click', () => {

  localStorage.clear()
  location.reload()

})


// Boton Graficar
let boton_graficar = document.getElementById('boton')

boton_graficar.addEventListener('click', () => {

  // Creacion nuevo serie
  datos = new Serie()

  // Tomo datos de handsontable y paso objeto
  data_hansontable = hot.getData()
    
  for (const i of data_hansontable){

    if (i[0] != null || i[1] != null){ 
      datos.agregar_valor_x(i[0])
      datos.agregar_valor_y(i[1])
    }

  }

  console.log(datos.eje_x)
  console.log(datos.eje_y)
  

  var data = [];

  // Creacion trace principal para graficar
  
  var {eje_x:dataX,eje_y:dataY} = datos

  var normal = {
    type: "scatter",
    mode: "lines",
    x: dataX,
    y: dataY,
    name: 'Valor Normal',
    line: {color: '#29a38f'} };
  
  
  data.push(normal)
  
  // Check ajuste fijo
  check_ajuste_fijo       = document.getElementById("check_ajuste_fijo")
  // Check ajuste porcentual
  check_ajuste_porcentual = document.getElementById("check_ajuste_porcentual")

  // Validacion check ajuste fijo y ajuste porcentual is checked
  if(check_ajuste_fijo.checked && check_ajuste_porcentual.checked){
    value_ajuste_fijo = document.getElementById("value_ajuste_fijo")
    value_ajuste_porcentual = document.getElementById("value_ajuste_porcentual")

    // Tomar valor
    var value_ajuste_fijo = parseFloat(value_ajuste_fijo.value)
    var value_ajuste_porcentual = parseFloat(value_ajuste_porcentual.value)
    
    datos.agregar_serie_y_ajustada(value_ajuste_fijo,value_ajuste_porcentual,...datos.eje_y)
    console.log(datos.eje_y_ajustado)

    var {eje_x:dataX,eje_y_ajustado:dataY_ajustada} = datos

    // Creacion trace ajustado
    var ajustado = {
      type: "scatter",
      mode: "lines",
      x: dataX,
      y: dataY_ajustada,
      name: 'Valor Ajustado',
      line: {color: 'red', dash: 'dot'}
    };
      
    data.push(ajustado) 
  }

  // Validacion check ajuste fijo is checked
  else if(check_ajuste_fijo.checked){
    value_ajuste_fijo = document.getElementById("value_ajuste_fijo")
    
    // Tomar valor
    var value_ajuste_fijo = parseFloat(value_ajuste_fijo.value)
        
    datos.agregar_serie_y_ajustada(value_ajuste_fijo,0,...datos.eje_y)
    console.log(datos.eje_y_ajustado)

    var {eje_x:dataX,eje_y_ajustado:dataY_ajustada} = datos

    // Creacion trace ajustado
    var ajustado = {
      type: "scatter",
      mode: "lines",
      x: dataX,
      y: dataY_ajustada,
      name: 'Valor Ajustado',
      line: {color: 'red', dash: 'dot'}
    };
      
    data.push(ajustado) 
}

  // Validacion check ajuste porcentual is checked
  else if(check_ajuste_porcentual.checked){
    value_ajuste_porcentual = document.getElementById("value_ajuste_porcentual")
    
    // Tomar valor
    var value_ajuste_porcentual = parseFloat(value_ajuste_porcentual.value)
        
    datos.agregar_serie_y_ajustada(0,value_ajuste_porcentual,...datos.eje_y)
    console.log(datos.eje_y_ajustado)

    var {eje_x:dataX,eje_y_ajustado:dataY_ajustada} = datos

    // Creacion trace ajustado
    var ajustado = {
      type: "scatter",
      mode: "lines",
      x: dataX,
      y: dataY_ajustada,
      name: 'Valor Ajustado',
      line: {color: 'red', dash: 'dot'}
    };
      
    data.push(ajustado) 
}


// Graficar
var layout = {
  title: 'Comparacion Serie Normal vs Ajustada',
};
  
var config = {locale: 'fr'};
  
Plotly.newPlot('grafico', data, layout, config);


// Tabla

let _table = document.getElementById('tableValues')   

_table.innerHTML = '<thead><tr><th scope="col">Time</th> <th scope="col">Values</th> <th scope="col">Values Ajusted</th></tr></thead><tbody></tbody>'

for (let index = 0; index < datos.eje_x.length; index++){

  row = _table.insertRow()
  timeTable = row.insertCell()
  timeTable.innerHTML = datos.eje_x[index]
  valueOriginal = row.insertCell()
  valueOriginal.innerHTML = datos.eje_y[index]
  valueAjusted = row.insertCell()
  if(datos.eje_y_ajustado[index]){
    valueAjusted.innerHTML = datos.eje_y_ajustado[index]
    }
    else{ 
    valueAjusted.innerHTML = '-' 
    }

}


})

// Boton Exportar Excel
let boton_exportar = document.getElementById('exportar')

boton_exportar.addEventListener('click', () => {

  console.log(datos.eje_y_ajustado.length)

  if(datos.eje_y_ajustado.length==0){
    obj_data = {
      'Time': datos.eje_x,
      'Values': datos.eje_y,
      }
  }
  else{
    obj_data = {
      'Time': datos.eje_x,
      'Values': datos.eje_y,
      'Ajusted Values': datos.eje_y_ajustado,
    }
  }

  df = new dfd.DataFrame(obj_data)
  df.toExcel(df, { fileName: "Series_.xlsx", download: true});


})