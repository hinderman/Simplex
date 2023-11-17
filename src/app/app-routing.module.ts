import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimplexIndexComponent } from './simplex-index/simplex-index.component';

const routes: Routes = [
    {
      path: "**",
      component: SimplexIndexComponent
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
