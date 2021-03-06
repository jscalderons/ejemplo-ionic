import { Component, OnInit } from '@angular/core';
import { VisitasService } from '../../services/visitas.service';
import { ModalController, AlertController, NavController } from '@ionic/angular';
import { UpdateVisitaPage } from '../update-visita/update-visita.page';
import { Pdv, Visita, Marca, Item } from '../../interfaces/interfaces';
import { UiServiceService } from '../../services/ui-service.service';
import { VisitaItemsService } from '../../services/visita-items.service';

@Component({
  selector: 'app-visitas',
  templateUrl: './visitas.page.html',
  styleUrls: ['./visitas.page.scss'],
})
export class VisitasPage implements OnInit {

  visitas: Visita[];
  pdvs: Pdv[];
  marcas: Marca[];

  constructor( private visitasService: VisitasService,
               private modalCtrl: ModalController,
               private ui: UiServiceService,
               private alertCtrl: AlertController,
               private visitaItemsService: VisitaItemsService,
               private navCtrl: NavController ) { }

    
  ngOnInit() {
    this.visitasService.getVisitas()
        .subscribe( async resp => {
          console.log(resp);
          await this.visitasService.storageVisitas( resp.visitas );
          this.visitas = await this.visitasService.getStorageVisitas();
          this.marcas = resp.marcas;
          this.pdvs = resp.pdvs;
          // GetAllitems debe conseguir los items referenciados no con el 
        // admin sino con la empresa_id de los items y a la que pertenece el mercaderista user del token
          await this.visitaItemsService.getAllItems();
        });
  }

  logout() {
      this.ui.logoutAlert();
  }

  async updateVisita(visita: Visita) {
    // Resive la visita y navega con ese input para geolocalizar y actualizarla
    // this.navCtrl.navigateRoot('update-visita'); // Mejor no navego sino que abro pagina en un Modal
    const modal = await this.modalCtrl.create({
      component: UpdateVisitaPage,
      cssClass: 'my-custom-class',
      componentProps: {
        visita,
        pdvs: this.pdvs
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    console.log(data);

    if ( data ) {
      this.almacenarVisita( data );
   }

    // Implementar foto visita
  }

  almacenarVisita( data ) {
    this.visitas.map( ( current ) => {
      if ( current.id === data.id ) {
        current = data;
      }
    });
    console.log(this.visitas);
    this.visitasService.storageVisitas( this.visitas );
  }



  visitaItems(visitaId: number) {
    // Con el id de la visita trae los items de esta (visitaItems) y actualiza cada visita item
    // El botón morado de calculadora de la visita
    this.visitasService.visitaItems1(visitaId)
      .subscribe( async resp => {
        await this.visitaItemsService.setVisitaItems( visitaId, resp );
        if ( resp.visitas_items.length === 0 ) {
          this.ui.presentToast('Sin Items Registrados');
        } else {        
          this.navCtrl.navigateForward(`items-visita/${ visitaId }`, { animated: true }); //NECESITO MANDAR EL ID DE LA VISITA PARA RENDERIZAR LOS ITEMS
        }
      });
    
  }

  async refrescar() {
    // No se usa uiService para el alert porque necesito recibir la misma data que en onInit
    const alert = await this.alertCtrl.create({
      message: 'Cuidado al REFRESCAR VISITAS sin enviar a la nuve los datos tomados. Si desea continuar presione OK',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            return false;
          }
        }, {
          text: 'OK',
          handler: () => {
            this.visitasService.getVisitas()
            .subscribe( resp => {
              console.log(resp);
              this.visitas = resp.visitas;
              this.marcas = resp.marcas;
              this.pdvs = resp.pdvs;
        });
          }
        }
      ]
    });

    await alert.present();
  }


}
