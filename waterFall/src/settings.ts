

module powerbi.extensibility.visual {
  import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;
  export class CircleSettings {
   public total_rect: string = "red";
   public small_rect_postive: string = "red";
   public small_rect_negative:string ='#D3D3D3';
   public text_postive:string ='green';
   public text_negative:string ='red'
   public axis_text_size:number= 12;
   public total_rect_text:number= 12
   public growth_chart_text:number=12
   public volume_rect_text:number= 12
   public  text_black = 'black'
   public  text_white = 'white'



  }
  export class VisualSettings extends DataViewObjectsParser {
   public Arc: CircleSettings = new CircleSettings();
     }

}
