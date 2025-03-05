import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TypeProduitService } from '../../services/type-produit.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-type-produit',
  templateUrl: './add-type-produit.component.html',
  styleUrls: ['./add-type-produit.component.css']
})
export class AddTypeProduitComponent implements OnInit {

  addProduitForm!: FormGroup;
  isSuccessful: boolean = false;
  isFailed: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddTypeProduitComponent>,
    private TproduitService: TypeProduitService,
    private fb: FormBuilder // Inject FormBuilder here
  ) {}

  ngOnInit(): void {
    // Initialize the form using FormBuilder
    this.addProduitForm = this.fb.group({
      name: ['', [Validators.required]],       // Name is required
      description: ['', [Validators.required]], // Description is required
      date: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]], // Date pattern YYYY-MM-DD
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  addProduit(): void {
    if (this.addProduitForm.valid) {
      // Create the newProduit object from form values
      const newProduit = this.addProduitForm.value;

      this.TproduitService.addTypeProduit(newProduit).subscribe(
        () => {
          this.isSuccessful = true;
          this.isFailed = false;
          this.dialogRef.close(true); // Close the dialog with success
        },
        (error) => {
          this.isFailed = true;
          this.isSuccessful = false;
          console.error('Error adding type produit:', error); // Log error for debugging
        }
      );
    } else {
      this.isFailed = true; // Show failure message if form is invalid
    }
  }
}
