import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { VisitasService } from '../../services/visitas.service';
import { ModalController, AlertController, NavController } from '@ionic/angular';
import { UiServiceService } from '../../services/ui-service.service';
import { Visitasitem, VisitaItemsRes, Item } from '../../interfaces/interfaces';
import { VisitaItemsService } from '../../services/visita-items.service';
import { InventarioPage } from '../inventario/inventario.page';

@Component({
  selector: 'app-items-visita',
  templateUrl: './items-visita.page.html',
  styleUrls: ['./items-visita.page.scss'],
})
export class ItemsVisitaPage implements OnInit {

  items: Visitasitem[] = [];
  itemsVisitaRes: VisitaItemsRes;
  marca: string;
  pdv: string;
  visitaId = null;
  // Items0 son los registros de la tabla items con sus nombres 
  items0: Item[] = [];  // Son los items en si con sus campos como nombre


  constructor( private route: ActivatedRoute,
               private visitasService: VisitasService,
               private modalCtrl: ModalController,
               private navCtrl: NavController,
               private visitaItemsService: VisitaItemsService ) { }

async ionViewWillEnter(){ // Carga primero la data y luego la página    
  
  this.visitaId =  this.route.snapshot.paramMap.get('id'); // Viaja con el id desde visitas
  console.log(this.visitaId); //OK

  // con visitasService.visitaItems1(visitaId) se consulta de la BD y se guarda en el storage los items y demas data de la viisita
  this.itemsVisitaRes = await this.visitaItemsService.getVisitaItems( this.visitaId ); // se rescata del storage
  console.log(this.itemsVisitaRes);  // ERROR       

  this.items0 = await this.visitaItemsService.getStorageAllItems(); //Todos los items guardados desde el logueo
  console.log('All Items');
  console.log(this.items0);
  console.log(this.itemsVisitaRes);

  this.items = this.itemsVisitaRes.visitas_items;
  this.marca = this.itemsVisitaRes.marca.nombre;
  this.pdv = this.itemsVisitaRes.pdv.nombre; 
}


  async ngOnInit() {   
    this.visitaId =  this.route.snapshot.paramMap.get('id'); // Viaja con el id desde visitas
    // PRIMERO COJO itemsVisitaRes DESDE EL SERVIDOR Y GUARDO EN STORAGE LA PRIMERA VEZ
    this.visitasService.visitaItems1( this.visitaId )
      .subscribe( resp => {
        // No se si es necesario o el seteo solo en onInit
        this.visitaItemsService.setVisitaItems( this.visitaId, resp ); 

        this.items = resp.visitas_items;
        this.marca = resp.marca.nombre;
        this.pdv = resp.pdv.nombre; 
      });
    
 }

  async salir() {
    // GUARDAR EN STORAGE??? O SE GUARDA DESDE CADA ITEM AL CERRAR EL MODAL EN updateItem(item) EN INVENTARIO
    this.visitaItemsService.setVisitaItems( this.visitaId, this.itemsVisitaRes ); // No se si es necesario o el seteo solo en onInit
    this.navCtrl.navigateRoot('visitas');
  }

  async updateItem( item: Visitasitem ) { // si esta een el storage antes de cargar componente inventario lo seteo en ionVIewWillEnter
    const modal = await this.modalCtrl.create({
      component: InventarioPage,
      cssClass: 'my-custom-class',
      componentProps: {
        item,
        items0: this.items0
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    console.log(data);

    if ( data ) {      
      this.visitaItemsService.setStorageItem( `${ this.visitaId }-${ data.id }` , data );// visita_id-visita_items_id
   }
  }

// EL UPLOAD LO HACE EL ITEM DENTRO DEL MODAL INVENTARIO QUE GUARDA EN EL STORAGE LA INFO HASTA TENER DATOS
 /*  visitaItemsUpload( item: Visitasitem ) { // boton en el slide con el item iterante y se usa el endpoint para update BD
    return this.visitaItemsService.updateVisitaItem( item );     
    
  } */

}


