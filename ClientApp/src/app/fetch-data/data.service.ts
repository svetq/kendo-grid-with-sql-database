import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  State,
  toDataSourceRequestString,
} from '@progress/kendo-data-query';

@Injectable()
export class DataService extends BehaviorSubject<any[]> {

  constructor(private http: HttpClient) {
    super([]);
  }

  private BASE_URL: string = 'api/Blogs';
  private data: any[] = [];
  public state: State = {
    skip: 0,
    take: 5
  };

  public read() {
      if (this.data.length) {
        return super.next(this.data);
      }

      this.fetch()
        .pipe(
          tap(data => {
            this.data = data;
          })
        )
        .subscribe(data => {
          super.next(data);
        });
    }


  public fetch(dataItem?: any, action: string = ''): Observable<any> {

    switch (action) {
      case '': {
        const queryStr = `${toDataSourceRequestString(this.state)}`;

        return this.http.get(`${this.BASE_URL}?${queryStr}`);
      }
      case 'create': {
        return this.http.post(`${this.BASE_URL}/create`, dataItem);
      }
      case 'edit': {
        return this.http.put(`${this.BASE_URL}/${dataItem.blogId}/edit`, dataItem);
      }
      case 'delete': {
        const options = {
          headers: {},
          body: dataItem,
        };

        return this.http.delete(`${this.BASE_URL}/${dataItem.blogId}/delete`, options);
      }
    }
  }

  public save(dataItem: any, isNew?: boolean) {
    if (isNew) {
      const newBlog = { Url: dataItem.url };
      this.fetch(newBlog, 'create').subscribe(() => this.read(), () => this.read());
    } else {
      this.fetch(dataItem, 'edit').subscribe(() => this.read(), () => this.read());
    }
  }

  public delete(dataItem: any) {
    this.fetch(dataItem, 'delete').subscribe(() => this.read(), () => this.read());
  }
}
