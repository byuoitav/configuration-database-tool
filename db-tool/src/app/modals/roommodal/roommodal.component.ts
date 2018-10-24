import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { Room, RoomConfiguration } from '../../objects';
import { Strings } from '../../services/strings.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material';
import { ApiService } from '../../services/api.service';

export interface RoomData {
  room: Room;
  roomExists: boolean;
}

@Component({
  selector: 'app-roommodal',
  templateUrl: './roommodal.component.html',
  styleUrls: ['./roommodal.component.scss']
})
export class RoomModalComponent implements OnInit {
  configurationList: RoomConfiguration[] = [];
  designationList: string[] = [];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(public dialogRef: MatDialogRef<RoomModalComponent>, @Inject(MAT_DIALOG_DATA) public data: RoomData, public S: Strings, private api: ApiService) { }

  ngOnInit() {
    this.GetRoomConfigurations();
    this.GetRoomDesignations();
  }

  ngOnChanges() {
  }

  close() {
    this.dialogRef.close();
  }

  ///// API FUNCTIONS /////
  SubmitRoom() {
    if(!this.data.roomExists) {
      this.api.AddRoom(this.data.room).subscribe(
        success => {
          this.api.WriteTempChanges();
          this.data.roomExists = true;
          this.dialogRef.close();
        },
        error => {
          this.dialogRef.close();
        });
    }
    else {
      this.api.UpdateRoom(this.data.room._id, this.data.room).subscribe(
        success => {
          this.api.WriteTempChanges();
          this.dialogRef.close();
        },
        error => {
          this.dialogRef.close();
        });
    }
  }

  DeleteRoom() {
    this.api.DeleteRoom(this.data.room._id).subscribe(
      success => {
        this.api.WriteTempChanges();
        this.data.roomExists = false;
        this.dialogRef.close();
      },
      error => {
        this.dialogRef.close();
      });
  }

  GetRoomConfigurations() {
    this.api.GetRoomConfigurations().subscribe(val => {
      if(val != null) {
        this.configurationList = val;
      }
    });
  }

  GetRoomDesignations() {
    this.api.GetRoomDesignations().subscribe(val => {
      if(val != null) {
        this.designationList = val;
      }
    });
  }

  ///// TAGS /////
  AddChip(event: MatChipInputEvent): void {
    if(this.data.room.tags == null || this.data.room.tags.length == 0) {
      this.data.room.tags = [];
    }

    const input = event.input;
    const value = event.value;

    // Add our tag
    if ((value || '').trim()) {
      this.data.room.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  RemoveChip(tag: string): void {
    let index_A = this.data.room.tags.indexOf(tag);
    if (index_A >= 0) {
      this.data.room.tags.splice(index_A, 1);
    }
  }
  /*-*/
}
