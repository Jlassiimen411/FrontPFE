import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProduitService } from 'src/app/services/produit.service';

@Component({
  selector: 'app-add-produit',
  templateUrl: './add-produit.component.html',
  styleUrls: ['./add-produit.component.css']
})
export class AddProduitComponent implements OnInit {
  produitForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService,
    private dialogRef: MatDialogRef<AddProduitComponent>
  ) {}

  ngOnInit(): void {
    this.produitForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', Validators.required]
    });
  }

  saveProduit(): void {
    if (this.produitForm.valid) {
      this.produitService.addProduit(this.produitForm.value).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
