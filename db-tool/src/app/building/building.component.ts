import { Component, OnInit, Input } from '@angular/core';
import { Building } from '../objects'
import { ApiService } from '../api.service';
import { MatDialog } from '@angular/material';
import { ModalComponent, MessageType, Result } from '../modal/modal.component';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DBError } from '../home/home.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';

@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.css']
})
export class BuildingComponent implements OnInit {
  @Input() InStepper: boolean = false;
  @Input() buildingExists: boolean = false;
  tabIndex: number = 0;

  buildingList: Building[] = [];
  @Input() addBuilding: Building;  
  @Input() editBuilding: Building;
  
  buildingMatcher = new DBError();
  AddFormGroup: FormGroup;
  EditFormGroup: FormGroup;
  addIDFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern("[A-Z0-9]*")
  ]);
  editIDFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern("[A-Z0-9]*")
  ]);

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private api: ApiService, public dialog: MatDialog, private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.AddFormGroup = this._formBuilder.group({
      addIDCtrl: ['', Validators.required]
    });
    this.EditFormGroup = this._formBuilder.group({
      editIDCtrl: ['', Validators.required]
    });

    this.tabIndex = 0;
    this.getBuildingList();

    this.addBuilding = new Building();
    this.editBuilding = new Building();
  }

  ngOnChanges() {
    setTimeout(() => {
      if(this.InStepper && this.buildingExists) {
        this.tabIndex = 1;
      }
      else {
        this.tabIndex = 0;
      }
    }, 0); 
  }

  getBuildingList() {
    this.buildingList = [];
    this.api.GetBuildingList().subscribe(val => {
      this.buildingList = val;
    });
  }

  CreateBuilding() {
    console.log(this.addBuilding);
    let res: Result[] = [];
    this.api.AddBuilding(this.addBuilding).subscribe(
      success => {
        res.push({message: this.addBuilding._id + " was successfully added.", success: true });
        this.openDialog(MessageType.Success, "Building Added", null, res);
      },
      error => {
        let errorMessage: string;
        // if(error.status === 500) {
        //   errorMessage = "Building already exists.";
        // }
        res.push({message: "Failed to add " + this.addBuilding._id, success: false, error: error});
        this.openDialog(MessageType.Error, errorMessage, null, res);
      });
  }

  UpdateBuilding() {
    console.log(this.editBuilding);
    let res: Result[] = [];
    this.api.UpdateBuilding(this.editBuilding).subscribe(
      success => {
        res.push({message: this.editBuilding._id + " was successfully updated.", success: true });
        this.openDialog(MessageType.Success, "", null, res);
      },
      error => {
        res.push({message: "Failed to update " + this.editBuilding._id, success: false, error: error});
        this.openDialog(MessageType.Error, "", null, res);
      });
  }

  openDialog(status: MessageType, subheader: string, message?: string, results?: Result[]) {
    let dialogRef = this.dialog.open(ModalComponent, {
      data: {type: status, subheader: subheader, message: message, results: results}
    });

    dialogRef.afterClosed().subscribe(result => {
      // if(this.locationDone) {
      //   this.locationDone = false;
      // }
      console.log('The dialog was closed');
    });
  }

  AddChip(event: MatChipInputEvent, add: boolean): void {
    if(add && (this.addBuilding.tags == null || this.addBuilding.tags.length == 0)) {
      this.addBuilding.tags = [];
    }
    if(!add && (this.editBuilding.tags == null || this.editBuilding.tags.length == 0)) {
      this.editBuilding.tags = [];
    }

    const input = event.input;
    const value = event.value;

    // Add our tag
    if ((value || '').trim() && add) {
      this.addBuilding.tags.push(value.trim());
    }
    else if ((value || '').trim() && !add) {
      this.editBuilding.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  RemoveChip(tag: string, add: boolean): void {
    
    if(add) {
      let index_A = this.addBuilding.tags.indexOf(tag);
      if (index_A >= 0) {
        this.addBuilding.tags.splice(index_A, 1);
      }
    }
    else {
      let index_E = this.editBuilding.tags.indexOf(tag);
      if (index_E >= 0) {
        this.editBuilding.tags.splice(index_E, 1);
      }
    }
  }
}
