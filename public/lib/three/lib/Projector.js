THREE.RenderableObject=function(){this.id=0,this.object=null,this.z=0,this.renderOrder=0},THREE.RenderableFace=function(){this.id=0,this.v1=new THREE.RenderableVertex,this.v2=new THREE.RenderableVertex,this.v3=new THREE.RenderableVertex,this.normalModel=new THREE.Vector3,this.vertexNormalsModel=[new THREE.Vector3,new THREE.Vector3,new THREE.Vector3],this.vertexNormalsLength=0,this.color=new THREE.Color,this.material=null,this.uvs=[new THREE.Vector2,new THREE.Vector2,new THREE.Vector2],this.z=0,this.renderOrder=0},THREE.RenderableVertex=function(){this.position=new THREE.Vector3,this.positionWorld=new THREE.Vector3,this.positionScreen=new THREE.Vector4,this.visible=!0},THREE.RenderableVertex.prototype.copy=function(e){this.positionWorld.copy(e.positionWorld),this.positionScreen.copy(e.positionScreen)},THREE.RenderableLine=function(){this.id=0,this.v1=new THREE.RenderableVertex,this.v2=new THREE.RenderableVertex,this.vertexColors=[new THREE.Color,new THREE.Color],this.material=null,this.z=0,this.renderOrder=0},THREE.RenderableSprite=function(){this.id=0,this.object=null,this.x=0,this.y=0,this.z=0,this.rotation=0,this.scale=new THREE.Vector2,this.material=null,this.renderOrder=0},THREE.Projector=function(){var e,r,t,n,i,o,a,s,l,c,p,E=[],u=0,d=[],h=0,f=[],m=0,v=[],R=0,x=[],y=0,T={objects:[],lights:[],elements:[]},H=new THREE.Vector3,w=new THREE.Vector4,g=new THREE.Box3(new THREE.Vector3(-1,-1,-1),new THREE.Vector3(1,1,1)),b=new THREE.Box3,M=new Array(3),S=(new Array(4),new THREE.Matrix4),z=new THREE.Matrix4,V=new THREE.Matrix4,j=new THREE.Matrix3,O=new THREE.Frustum,C=new THREE.Vector4,L=new THREE.Vector4;this.projectVector=function(e,r){console.warn("THREE.Projector: .projectVector() is now vector.project()."),e.project(r)},this.unprojectVector=function(e,r){console.warn("THREE.Projector: .unprojectVector() is now vector.unproject()."),e.unproject(r)},this.pickingRay=function(e,r){console.error("THREE.Projector: .pickingRay() is now raycaster.setFromCamera().")};var k=new function(){var e=[],r=[],n=null,o=null,s=new THREE.Matrix3;function l(e){var r=e.position,t=e.positionWorld,n=e.positionScreen;t.copy(r).applyMatrix4(p),n.copy(t).applyMatrix4(z);var i=1/n.w;n.x*=i,n.y*=i,n.z*=i,e.visible=n.x>=-1&&n.x<=1&&n.y>=-1&&n.y<=1&&n.z>=-1&&n.z<=1}function c(e,r,t){return!0===e.visible||!0===r.visible||!0===t.visible||(M[0]=e.positionScreen,M[1]=r.positionScreen,M[2]=t.positionScreen,g.intersectsBox(b.setFromPoints(M)))}function E(e,r,t){return(t.positionScreen.x-e.positionScreen.x)*(r.positionScreen.y-e.positionScreen.y)-(t.positionScreen.y-e.positionScreen.y)*(r.positionScreen.x-e.positionScreen.x)<0}return{setObject:function(t){o=(n=t).material,s.getNormalMatrix(n.matrixWorld),e.length=0,r.length=0},projectVertex:l,checkTriangleVisibility:c,checkBackfaceCulling:E,pushVertex:function(e,r,n){(t=N()).position.set(e,r,n),l(t)},pushNormal:function(r,t,n){e.push(r,t,n)},pushUv:function(e,t){r.push(e,t)},pushLine:function(e,r){var t=d[e],i=d[r];(a=B()).id=n.id,a.v1.copy(t),a.v2.copy(i),a.z=(t.positionScreen.z+i.positionScreen.z)/2,a.renderOrder=n.renderOrder,a.material=n.material,T.elements.push(a)},pushTriangle:function(t,a,l){var p=d[t],u=d[a],h=d[l];if(!1!==c(p,u,h)&&(o.side===THREE.DoubleSide||!0===E(p,u,h))){(i=W()).id=n.id,i.v1.copy(p),i.v2.copy(u),i.v3.copy(h),i.z=(p.positionScreen.z+u.positionScreen.z+h.positionScreen.z)/3,i.renderOrder=n.renderOrder,i.normalModel.fromArray(e,3*t),i.normalModel.applyMatrix3(s).normalize();for(var f=0;f<3;f++){var m=i.vertexNormalsModel[f];m.fromArray(e,3*arguments[f]),m.applyMatrix3(s).normalize();var v=i.uvs[f];v.fromArray(r,2*arguments[f])}i.vertexNormalsLength=3,i.material=n.material,T.elements.push(i)}}}};function N(){if(n===h){var e=new THREE.RenderableVertex;return d.push(e),h++,n++,e}return d[n++]}function W(){if(o===m){var e=new THREE.RenderableFace;return f.push(e),m++,o++,e}return f[o++]}function B(){if(s===R){var e=new THREE.RenderableLine;return v.push(e),R++,s++,e}return v[s++]}function F(){if(c===y){var e=new THREE.RenderableSprite;return x.push(e),y++,c++,e}return x[c++]}function P(e,r){return e.renderOrder!==r.renderOrder?e.renderOrder-r.renderOrder:e.z!==r.z?r.z-e.z:e.id!==r.id?e.id-r.id:0}function A(e,r){var t=0,n=1,i=e.z+e.w,o=r.z+r.w,a=-e.z+e.w,s=-r.z+r.w;return i>=0&&o>=0&&a>=0&&s>=0||!(i<0&&o<0||a<0&&s<0)&&(i<0?t=Math.max(t,i/(i-o)):o<0&&(n=Math.min(n,i/(i-o))),a<0?t=Math.max(t,a/(a-s)):s<0&&(n=Math.min(n,a/(a-s))),!(n<t)&&(e.lerp(r,t),r.lerp(e,1-n),!0))}this.projectScene=function(t,h,f,m){function v(t){(e=function(){if(r===u){var e=new THREE.RenderableObject;return E.push(e),u++,r++,e}return E[r++]}()).id=t.id,e.object=t,H.setFromMatrixPosition(t.matrixWorld),H.applyMatrix4(z),e.z=H.z,e.renderOrder=t.renderOrder,T.objects.push(e)}o=0,s=0,c=0,T.elements.length=0,!0===t.autoUpdate&&t.updateMatrixWorld(),null===h.parent&&h.updateMatrixWorld(),S.copy(h.matrixWorldInverse.getInverse(h.matrixWorld)),z.multiplyMatrices(h.projectionMatrix,S),O.setFromMatrix(z),r=0,T.objects.length=0,T.lights.length=0,t.traverseVisible((function(e){if(e instanceof THREE.Light)T.lights.push(e);else if(e instanceof THREE.Mesh||e instanceof THREE.Line){if(!1===e.material.visible)return;if(!0===e.frustumCulled&&!1===O.intersectsObject(e))return;v(e)}else if(e instanceof THREE.Sprite){if(!1===e.material.visible)return;if(!0===e.frustumCulled&&!1===O.intersectsSprite(e))return;v(e)}})),!0===f&&T.objects.sort(P);for(var R=0,x=T.objects.length;R<x;R++){var y=T.objects[R].object,g=y.geometry;if(k.setObject(y),p=y.matrixWorld,n=0,y instanceof THREE.Mesh){if(g instanceof THREE.BufferGeometry){var b=g.attributes,M=g.groups;if(void 0===b.position)continue;for(var D=0,G=(we=b.position.array).length;D<G;D+=3)k.pushVertex(we[D],we[D+1],we[D+2]);if(void 0!==b.normal){var I=b.normal.array;for(D=0,G=I.length;D<G;D+=3)k.pushNormal(I[D],I[D+1],I[D+2])}if(void 0!==b.uv){var U=b.uv.array;for(D=0,G=U.length;D<G;D+=2)k.pushUv(U[D],U[D+1])}if(null!==g.index){var q=g.index.array;if(M.length>0)for(var J=0;J<M.length;J++){var K=M[J];for(D=K.start,G=K.start+K.count;D<G;D+=3)k.pushTriangle(q[D],q[D+1],q[D+2])}else for(D=0,G=q.length;D<G;D+=3)k.pushTriangle(q[D],q[D+1],q[D+2])}else for(D=0,G=we.length/3;D<G;D+=3)k.pushTriangle(D,D+1,D+2)}else if(g instanceof THREE.Geometry){var Q=g.vertices,X=g.faces,Y=g.faceVertexUvs[0];j.getNormalMatrix(p);for(var Z=y.material,$=Z instanceof THREE.MultiMaterial,_=!0===$?y.material:null,ee=0,re=Q.length;ee<re;ee++){var te=Q[ee];if(H.copy(te),!0===Z.morphTargets)for(var ne=g.morphTargets,ie=y.morphTargetInfluences,oe=0,ae=ne.length;oe<ae;oe++){var se=ie[oe];if(0!==se){var le=ne[oe].vertices[ee];H.x+=(le.x-te.x)*se,H.y+=(le.y-te.y)*se,H.z+=(le.z-te.z)*se}}k.pushVertex(H.x,H.y,H.z)}for(var ce=0,pe=X.length;ce<pe;ce++){var Ee=X[ce];if(void 0!==(Z=!0===$?_.materials[Ee.materialIndex]:y.material)){var ue=Z.side,de=d[Ee.a],he=d[Ee.b],fe=d[Ee.c];if(!1!==k.checkTriangleVisibility(de,he,fe)){var me=k.checkBackfaceCulling(de,he,fe);if(ue!==THREE.DoubleSide){if(ue===THREE.FrontSide&&!1===me)continue;if(ue===THREE.BackSide&&!0===me)continue}(i=W()).id=y.id,i.v1.copy(de),i.v2.copy(he),i.v3.copy(fe),i.normalModel.copy(Ee.normal),!1!==me||ue!==THREE.BackSide&&ue!==THREE.DoubleSide||i.normalModel.negate(),i.normalModel.applyMatrix3(j).normalize();for(var ve=Ee.vertexNormals,Re=0,xe=Math.min(ve.length,3);Re<xe;Re++){var ye=i.vertexNormalsModel[Re];ye.copy(ve[Re]),!1!==me||ue!==THREE.BackSide&&ue!==THREE.DoubleSide||ye.negate(),ye.applyMatrix3(j).normalize()}i.vertexNormalsLength=ve.length;var Te=Y[ce];if(void 0!==Te)for(var He=0;He<3;He++)i.uvs[He].copy(Te[He]);i.color=Ee.color,i.material=Z,i.z=(de.positionScreen.z+he.positionScreen.z+fe.positionScreen.z)/3,i.renderOrder=y.renderOrder,T.elements.push(i)}}}}}else if(y instanceof THREE.Line){if(g instanceof THREE.BufferGeometry){if(void 0!==(b=g.attributes).position){var we;for(D=0,G=(we=b.position.array).length;D<G;D+=3)k.pushVertex(we[D],we[D+1],we[D+2]);if(null!==g.index)for(D=0,G=(q=g.index.array).length;D<G;D+=2)k.pushLine(q[D],q[D+1]);else{var ge=y instanceof THREE.LineSegments?2:1;for(D=0,G=we.length/3-1;D<G;D+=ge)k.pushLine(D,D+1)}}}else if(g instanceof THREE.Geometry){if(V.multiplyMatrices(z,p),0===(Q=y.geometry.vertices).length)continue;(de=N()).positionScreen.copy(Q[0]).applyMatrix4(V);for(ge=y instanceof THREE.LineSegments?2:1,ee=1,re=Q.length;ee<re;ee++)(de=N()).positionScreen.copy(Q[ee]).applyMatrix4(V),(ee+1)%ge>0||(he=d[n-2],C.copy(de.positionScreen),L.copy(he.positionScreen),!0===A(C,L)&&(C.multiplyScalar(1/C.w),L.multiplyScalar(1/L.w),(a=B()).id=y.id,a.v1.positionScreen.copy(C),a.v2.positionScreen.copy(L),a.z=Math.max(C.z,L.z),a.renderOrder=y.renderOrder,a.material=y.material,y.material.vertexColors===THREE.VertexColors&&(a.vertexColors[0].copy(y.geometry.colors[ee]),a.vertexColors[1].copy(y.geometry.colors[ee-1])),T.elements.push(a)))}}else if(y instanceof THREE.Sprite){w.set(p.elements[12],p.elements[13],p.elements[14],1),w.applyMatrix4(z);var be=1/w.w;w.z*=be,w.z>=-1&&w.z<=1&&((l=F()).id=y.id,l.x=w.x*be,l.y=w.y*be,l.z=w.z,l.renderOrder=y.renderOrder,l.object=y,l.rotation=y.rotation,l.scale.x=y.scale.x*Math.abs(l.x-(w.x+h.projectionMatrix.elements[0])/(w.w+h.projectionMatrix.elements[12])),l.scale.y=y.scale.y*Math.abs(l.y-(w.y+h.projectionMatrix.elements[5])/(w.w+h.projectionMatrix.elements[13])),l.material=y.material,T.elements.push(l))}}return!0===m&&T.elements.sort(P),T}};